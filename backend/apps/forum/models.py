from django.db import models
from apps.users.models import User
from django.utils import timezone

def default_created_at():
    return timezone.localtime(timezone.now())

class DiscussionForum(models.Model):
    id_discussion_forum = models.AutoField(primary_key=True)
    membres = models.ManyToManyField(User, related_name='discussionsF')
    profile = models.ImageField(upload_to='forum/profiles/groupes/', default='forum/profiles/groupes/default.jpg')
    created_at = models.DateTimeField(default=default_created_at)


    class Meta:
        db_table = 'discussionforum'

    def __str__(self):
        return str(self.id_discussion_forum)

class MessageDF(models.Model):
    id_messageDF = models.AutoField(primary_key=True)
    discussionF = models.ForeignKey(DiscussionForum, related_name='messages', on_delete=models.CASCADE)
    contenu = models.TextField(null=True, blank=True)
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    is_anonymous=models.BooleanField(default=False)
    likes = models.ManyToManyField(User,related_name='messageDF_likes')
    dislikes = models.ManyToManyField(User,related_name='messageDF_dislikes')
    created_at = models.DateTimeField(default=default_created_at)


    class Meta:
        db_table = 'message'

class FileDF(models.Model):
    id_file = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='forum/message_files/')
    messageDF = models.ForeignKey(MessageDF,on_delete=models.CASCADE,related_name='files')

    def __str__(self):
        return self.file.name.split('/')[-1]

    class Meta:
        db_table = 'file_message'

class ImageDF(models.Model):
    id_image = models.AutoField(primary_key=True)
    messageDF = models.ForeignKey(MessageDF,on_delete=models.CASCADE,related_name='images')
    image = models.ImageField(upload_to='forum/message_images/')

    def __str__(self):
        return self.image.name.split('/')[-1]
    
    class Meta:
        db_table = 'image_message'