"""Supabase client initialization for StadiumIQ.

Creates a lazy client that only connects when actually used,
so the server can start without valid Supabase credentials.
"""

import logging
from core.config import settings

logger = logging.getLogger(__name__)

supabase = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your_" not in settings.SUPABASE_URL:
        from supabase import create_client, Client
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    else:
        logger.warning("Supabase credentials not configured — database features disabled")
except Exception as e:
    logger.warning(f"Supabase client init failed: {e} — database features disabled")
