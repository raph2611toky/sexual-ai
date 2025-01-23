from django.contrib import admin
from apps.menstruation.models import Symptom

class SymptomAdmin(admin.ModelAdmin):
    list_display = ('date', 'title', 'symptom_type', 'description')
    list_filter = ('symptom_type', 'date')
    search_fields = ('title', 'description')
    ordering = ('-date',)
    
admin.site.register(Symptom, SymptomAdmin)