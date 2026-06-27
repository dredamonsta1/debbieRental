import cron from "node-cron";
import { listDueSoon, markOverdue } from "../repositories/rentals";

export function startReturnReminders() {
  cron.schedule("0 * * * *", async () => {
    const overdueCount = await markOverdue();
    const dueSoon = await listDueSoon(24);

    if (overdueCount > 0) {
      console.log(`[reminders] Marked ${overdueCount} rental(s) as overdue.`);
    }
    if (dueSoon.length > 0) {
      console.log(`[reminders] ${dueSoon.length} rental(s) due within 24h:`);
      for (const r of dueSoon) {
        console.log(`  - rental=${r.id} vehicle=${r.vehicle_id} due_at=${r.due_at}`);
      }
    }
  });

  console.log("[reminders] hourly return-reminder job scheduled");
}
