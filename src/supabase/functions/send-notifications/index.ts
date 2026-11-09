// Supabase Edge Function: send-notifications
// Запускается pg_cron каждый день в 9:30 мск (06:30 UTC).
// Берёт дедлайны в ближайшие 2 дня и отправляет уведомления в ЛС VK
// от имени сообщества и в Telegram-бот — ТОЛЬКО тем, у кого включён
// тумблер уведомлений (vk_notify_enabled / tg_notify_enabled).
// Все дедлайны одного запуска объединяются в ОДНО сообщение.
// Время в сообщениях всегда московское, «сегодня/завтра/послезавтра»
// считаются по календарным датам мск, а не по количеству часов.
// В журнал notifications_sent попадают только УСПЕШНО доставленные
// сообщения — недоставленные досылаются на следующем запуске.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const VK_COMMUNITY_TOKEN = Deno.env.get("VK_COMMUNITY_TOKEN") || "";
const TG_BOT_TOKEN = Deno.env.get("TG_BOT_TOKEN") || "";

// Календарная дата в мск в виде частей (год, месяц, день)
function moscowParts(d: Date): { y: number; m: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), day: get("day") };
}

// Сколько календарных суток мск между двумя моментами
function calendarDayDiff(from: Date, to: Date): number {
  const a = moscowParts(from);
  const b = moscowParts(to);
  const aDays = Date.UTC(a.y, a.m - 1, a.day);
  const bDays = Date.UTC(b.y, b.m - 1, b.day);
  return Math.round((bDays - aDays) / (24 * 60 * 60 * 1000));
}

function getRelativeTime(dueDate: Date, now: Date): string {
  const diffDays = calendarDayDiff(now, dueDate);
  if (diffDays <= 0) return "сегодня";
  if (diffDays === 1) return "завтра";
  if (diffDays === 2) return "послезавтра";
  return `через ${diffDays} дней`;
}

function deadlineWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "дедлайн";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дедлайна";
  return "дедлайнов";
}

function formatDue(dueDate: Date): string {
  // Сервер работает в UTC, пользователю нужен мск — зона указана явно
  return dueDate.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Одна строка в общем списке дедлайнов
function buildDeadlineLine(d: any, now: Date): string {
  const due = new Date(d.due_date);
  const relative = getRelativeTime(due, now);

  let line = `⏰ ${relative} — 📋 ${d.title}`;
  if (d.subject) line += ` (${d.subject})`;
  if (d.description) line += `\n   ${d.description}`;
  line += `\n   🕐 Срок: ${formatDue(due)}`;
  return line;
}

// Общее сообщение: все дедлайны одним списком, ближайший сверху
function buildMessage(deadlines: any[], now: Date): string {
  const header = deadlines.length === 1
    ? "🔔 Напоминание о дедлайне:"
    : `🔔 Напоминание: ${deadlines.length} ${deadlineWord(deadlines.length)} впереди!`;

  const lines = deadlines
    .slice()
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map((d) => buildDeadlineLine(d, now));

  return `${header}\n\n${lines.join("\n\n")}`;
}

// Возвращает true, только если VK API подтвердил доставку
// (например, ошибка 901 — пользователь запретил сообщения от сообщества).
async function sendVK(userId: string, message: string): Promise<boolean> {
  if (!VK_COMMUNITY_TOKEN) return false;
  try {
    const res = await fetch("https://api.vk.com/method/messages.send", {
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
    const json = await res.json();
    if (json?.error) {
      console.error(`VK error ${json.error.error_code} for user ${userId}:`, json.error.error_msg);
      return false;
    }
    return true;
  } catch (e) {
    console.error("VK network error:", e);
    return false;
  }
}

// Возвращает true, только если Telegram API подтвердил доставку
// (403 — пользователь не запустил бота).
async function sendTG(chatId: string, message: string): Promise<boolean> {
  if (!TG_BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const json = await res.json();
    if (!json?.ok) {
      console.error(`TG error for chat ${chatId}:`, json?.description || "unknown");
      return false;
    }
    return true;
  } catch (e) {
    console.error("TG network error:", e);
    return false;
  }
}

Deno.serve(async () => {
  try {
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const { data: deadlines, error: dErr } = await supabase
      .from("deadlines")
      .select("*")
      .gte("due_date", now.toISOString())
      .lte("due_date", inTwoDays.toISOString());

    if (dErr) throw dErr;

    if (!deadlines?.length) {
      return new Response(JSON.stringify({ message: "Нет дедлайнов для уведомления" }));
    }

    const { data: vkUsers } = await supabase
      .from("profiles")
      .select("id, vk_id")
      .eq("vk_notify_enabled", true)
      .not("vk_id", "is", null);

    const { data: tgUsers } = await supabase
      .from("profiles")
      .select("id, telegram_id")
      .eq("tg_notify_enabled", true)
      .not("telegram_id", "is", null);

    const deadlineIds = deadlines.map((d) => d.id);

    const { data: sentRecords } = await supabase
      .from("notifications_sent")
      .select("deadline_id, profile_id, platform")
      .in("deadline_id", deadlineIds);

    const sentSet = new Set(
      (sentRecords || []).map((r) => `${r.deadline_id}-${r.profile_id}-${r.platform}`)
    );

    let sent = 0;
    const newRecords: any[] = [];

    // Отправляет пользователю только НЕ отправленные ему дедлайны одним сообщением
    async function notify(
      platform: string,
      users: any[] | null,
      send: (id: string, msg: string) => Promise<boolean>
    ) {
      for (const u of users || []) {
        const fresh = deadlines.filter(
          (d) => !sentSet.has(`${d.id}-${u.id}-${platform}`)
        );
        if (fresh.length === 0) continue; // всё уже отправлено — не беспокоим

        const msg = buildMessage(fresh, now);
        const ok = await send(u.vk_id ?? u.telegram_id, msg);
        if (!ok) continue; // не доставлено — попробуем на следующем запуске

        for (const d of fresh) {
          newRecords.push({ deadline_id: d.id, profile_id: u.id, platform });
          sent++;
        }
      }
    }

    await notify("vk", vkUsers, (id, msg) => sendVK(id, msg));
    await notify("telegram", tgUsers, (id, msg) => sendTG(id, msg));

    if (newRecords.length > 0) {
      const { error: insErr } = await supabase
        .from("notifications_sent")
        .upsert(newRecords, {
          onConflict: "deadline_id,profile_id,platform",
          ignoreDuplicates: true,
        });
      if (insErr) console.error("journal insert error:", insErr.message);
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
