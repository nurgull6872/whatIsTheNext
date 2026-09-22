from rest_framework.routers import DefaultRouter

from .views import PollViewSet

app_name = "polls"

router = DefaultRouter()
router.register("polls", PollViewSet, basename="poll")

urlpatterns = router.urls
