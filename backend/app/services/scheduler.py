from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.pipeline.agents.orchestrator import OrchestratorAgent


def build_scheduler(orchestrator: OrchestratorAgent) -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="Asia/Shanghai")
    scheduler.add_job(orchestrator.run, IntervalTrigger(minutes=30), id="high-frequency", kwargs={"mode": "live", "job_name": "high_frequency_pool"}, replace_existing=True)
    scheduler.add_job(orchestrator.run, IntervalTrigger(hours=2), id="regular-pool", kwargs={"mode": "live", "job_name": "regular_pool"}, replace_existing=True)
    scheduler.add_job(orchestrator.run, CronTrigger(hour="9,21", minute=0), id="trend-analysis", kwargs={"mode": "live", "job_name": "trend_analysis"}, replace_existing=True)
    scheduler.add_job(orchestrator.run, CronTrigger(day_of_week="mon", hour=9, minute=30), id="weekly-report", kwargs={"mode": "live", "job_name": "weekly_report"}, replace_existing=True)
    return scheduler
