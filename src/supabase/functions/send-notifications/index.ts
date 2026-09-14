// Supabase Edge Function: send-notifications
// Проверяет дедлайны (за 2 дня и ближе) и отправляет уведомления в ВК и Telegram.
//
// Деплой:
//   supabase functions deploy send-notifications --no-verify-jwt
//
// Секреты:
//   supabase secrets set VK_COMMUNITY_TOKEN=vk1.a.6RGRSbvO-wpOhwDkUl7Sb63DNtCFMoRocWdBm0AHn_XT5VHdS_WY31WWpv29wIVVjhgO96hwIn8k-HVo7YGiY-Cyyo5avq5oJjCMRH6z9WQaccKg-VUEnbZgMj-46zVzw9v2nRrzVnIgbc1uoGw3tFWs7lYm3mNBwp1UDQsE3pDvcYbaSEOUgeo6QnIpnJW69PdhpMrhVvg9UqkJvI_dWg
//   supabase secrets set TG_BOT_TOKEN=8737556707:AAEHgNHqzg7KHTo3nlyLAFKlA04CKYYt9a4
//
// Расписание (pg_cron, выполнять в SQL Editor):
//   select cron.schedule(
//     'deadline-notifications', '0 9 * * *',
//     $$ select net.http_post(
//       url := 'https://yrjhzqadvfpjnuubaxnb.supabase.co/functions/v1/send-notifications',
//       headers := jsonb_build_object('Content-Type', 'application/json'),
//       body := '{}'::jsonb
//     ); $$
//   );

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const VK_COMMUNITY_TOKEN = Deno.env.get("VK_COMMUNITY_TOKEN") || "";
const TG_BOT_TOKEN = Deno.env.get("TG_BOT_TOKEN") || "";

// Склонение слова «день» по числу
function dayWord(n: number): string {
  if (n === 1) return "день";
  if (n >= 2 && n <= 4) return "дня";
  return "дней";
}

// Человекочитаемый остаток времени до дедлайна
function getRelativeTime(dueDate: Date, now: Date): string {
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "сегодня";
  if (diffDays === 1) return "завтра";
  return `через ${diffDays} ${dayWord(diffDays)}`;
}

// Формирует текст сообщения из данных дедлайна
function buildMessage(d: any, now: Date): string {
  const due = new Date(d.due_date);
  const relative = getRelativeTime(due, now);

  let msg = `⏰ Дедлайн ${relative}!\n\n📝 ${d.title}`;
  if (d.subject) msg += `\n📚 ${d.subject}`;
  if (d.description) msg += `\n\n${d.description}`;

  const dateStr = due.toLocaleString("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
  msg += `\n\n📅 Срок: ${dateStr}`;

  return msg;
}

async function sendVK(userId: string, message: string) {
  if (!VK_COMMUNITY_TOKEN) return;
  try {
    await fetch("https://api.vk.com/method/messages.send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: VK_COMMUNITY_TOKEN,
        user_id: userId,
        message,
        random_id: String(Math.floor(Math.random() * 1e9)),
        v: "5.199",
      }),
    });
  } catch (e) {
    console.error("VK error:", e);
  }
}

async function sendTG(chatId: string, message: string) {
  if (!TG_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (e) {
    console.error("TG error:", e);
  }
}

Deno.serve(async () => {
  try {
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Дедлайны в ближайшие 2 дня, ещё не уведомлённые
    const { data: deadlines, error: dErr } = await supabase
      .from("deadlines")
      .select("*")
      .eq("is_notified", false)
      .gte("due_date", now.toISOString())
      .lte("due_date", inTwoDays.toISOString());

    if (dErr) throw dErr;
    if (!deadlines?.length) {
      return new Response(JSON.stringify({ message: "Нет дедлайнов для уведомления" }));
    }

    // Пользователи, включившие уведомления
    const { data: vkUsers } = await supabase
      .from("profiles")
      .select("vk_id")
      .eq("vk_notify_enabled", true)
      .not("vk_id", "is", null);

    const { data: tgUsers } = await supabase
      .from("profiles")
      .select("telegram_id")
      .eq("tg_notify_enabled", true)
      .not("telegram_id", "is", null);

    let sent = 0;

    for (const d of deadlines) {
      const msg = buildMessage(d, now);

      for (const u of vkUsers || []) {
        await sendVK(u.vk_id, msg);
        sent++;
      }
      for (const u of tgUsers || []) {
        await sendTG(u.telegram_id, msg);
        sent++;
      }

      // Помечаем как уведомлённый, чтобы не отправить повторно
      await supabase.from("deadlines").update({ is_notified: true }).eq("id", d.id);
    }

    return new Response(JSON.stringify({
      deadlines: deadlines.length,
      messages_sent: sent,
    }));
  } catch (e) {
    console.error("Notification error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
