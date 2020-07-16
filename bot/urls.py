from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('main/', views.chat, name='chat'),
    path('name/', views.setname, name='setname'),
    path('getAnswer/', views.answer, name='answer'),
    path('createLog/', views.createLog, name='log'),
    path('saveLog/', views.saveLog, name='logs'),
    path('thankyou/', views.thankyou, name='thankyou'),
    path('download/', views.download, name='download'),
]
