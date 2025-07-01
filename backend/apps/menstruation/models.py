from django.db import models

from apps.users.models import User, default_created_at

REGLE_TYPE = [
        ('regulier','Régulier'),
        ('irregulier', 'Irrégulier')
    ]

class Symptom(models.Model):
    id_symptom = models.AutoField(primary_key=True)
    
    TYPE_CHOICES = [
        ('general', 'Général'),
        ('ovulation', 'Ovulation'),
        ('menstrual', 'Menstruel')
    ]
    CATEGORY_CHOICES = [
        ('physique', 'Physique'),
        ('emotion', 'Émotion'),
        ('humeur', 'Humeur')
    ]
    
    date = models.DateField(default=default_created_at)
    title = models.CharField(max_length=100)
    description = models.TextField()
    symptom_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='general')
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='physique')
    
    def __str__(self):
        return f"Symptôme le {self.date}: {self.description} - Type: {self.symptom_type}, Catégorie: {self.category}"
    
    class Meta:
        db_table = 'symptom'

class Woman(models.Model):
    id_woman = models.AutoField(primary_key=True)
    
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='woman')
    
    average_cycle_length = models.IntegerField(default=28)
    average_menstruation_duration = models.IntegerField(default=4)
    last_period_date = models.DateField(null=True, blank=True)
    symptoms = models.ManyToManyField(Symptom,related_name='symptoms')
    regle_type = models.CharField(max_length=50, choices=REGLE_TYPE, default='regulier')
    
    def __str__(self):
        return str(self.woman)
    
    def get_cycle(self):
        menstruations = self.menstruations.all().order_by('-start_date')
        if menstruations.count()<2: irregulier_cycle_length = self.average_cycle_length
        else:
            last_date = menstruations.first().start_date
            next_last_date = menstruations[1].start_date
            irregulier_cycle_length = (last_date - next_last_date).days
        return self.average_cycle_length if self.regle_type=='regulier' else irregulier_cycle_length
    
    def update_average_cycle_length(self):
        menstruations = self.menstruations.all()
        if menstruations.count() > 1:
            total_cycle_length = 0
            for m in menstruations:
                if not m.end_date is None:
                    total_cycle_length += (m.end_date - m.start_date).days
            if menstruations.count()-1 == 0:
                self.average_cycle_length = 28
            else:
                self.average_cycle_length = total_cycle_length // (menstruations.count()-1)
            self.save()
    
    class Meta:
        db_table = 'woman'
        
class Menstruation(models.Model):
    id_menstruation = models.AutoField(primary_key=True)
    woman = models.ForeignKey(Woman, on_delete=models.CASCADE, related_name='menstruations')
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    cycle_length = models.IntegerField(blank=True, null=True)
    
    def __str__(self):
        return f"Cycle from {self.start_date} to {self.end_date} (Duration: {self.cycle_length} days)"

    class Meta:
        db_table = 'menstruation'

class Ovulation(models.Model):
    id_ovulation = models.AutoField(primary_key=True)
    woman = models.ForeignKey(Woman, on_delete=models.CASCADE, related_name='ovulations')
    predicted_ovulation_date = models.DateField()
    fertility_window_start = models.DateField()
    fertility_window_end = models.DateField()
    symptoms = models.ManyToManyField(Symptom, related_name='ovulation_symptoms', blank=True)
    
    def __str__(self):
        return f"Ovulation le {self.predicted_ovulation_date}"

    class Meta:
        db_table = 'ovulation'

class Notification(models.Model):
    id_notification = models.AutoField(primary_key=True)
    woman = models.ForeignKey(Woman, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.message

    class Meta:
        db_table = 'notification'
