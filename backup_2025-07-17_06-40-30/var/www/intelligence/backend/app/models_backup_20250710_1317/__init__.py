"""
Intelligence Platform - Models
Minimal imports to avoid circular dependencies
"""

# Base
from .base import Base

# Core models 
from .users import User
from .company import Company

# Secondary models
from .other import SubType, Owner, PhaseTemplate, Opportunity, CrmLink
from .activity import Activity
from .ticket import Ticket  
from .task import Task

# Additional models (if they exist)
try:
    from .assessment import *
except ImportError:
    pass

try:
    from .business_card import *
except ImportError:
    pass

try:
    from .contact import *
except ImportError:
    pass

try:
    from .hashtag import *
except ImportError:
    pass

try:
    from .knowledge import *
except ImportError:
    pass

try:
    from .ai_conversation import *
except ImportError:
    pass

try:
    from .commesse import *
except ImportError:
    pass
