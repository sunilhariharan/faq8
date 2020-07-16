from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from .customsearch import fetchResponse
import json
import datetime
import os
from pytz import timezone
import mimetypes

def index(request):
    if request.session.has_key('username'):
        return chat(request)
    return render(request, 'chat.html')


def setname(request):
    data = json.loads(request.read())
    request.session['username'] = data['name'].upper()
    return HttpResponse(status=200)


def chat(request):
    if request.session.has_key('username'):
        context = {'name': request.session['username']}
        return render(request, 'main.html', context)
    else:
        return index(request)


def answer(request):
    data = json.loads(request.read())
    answer = fetchResponse(data['question'])
    return JsonResponse(answer,safe=False)


def saveLog(request):
    name = request.session['username']
    data = json.loads(request.read())
    k=[]
    for i in range(len(data)-1):
        if 'text' in data[i]:
            person=[data[i]['user'],data[i]['bot'],data[i]['text']]
            k.append(person)
        elif 'title' in data[i]:
            person=[data[i]['user'],data[i]['bot'],data[i]['title']]
            k.append(person)
    p=[]
    for j in range(len(k)):
        if(k[j][0]==False):
            p.append("bot : "+str(k[j][2]))
        elif(k[j][0]==True):
            p.append("user : "+str(k[j][2]))
    now = datetime.datetime.now(timezone('Asia/Kolkata'))
    time=now.strftime("%Y_%m_%d_%H_%M_%S")
    path='./logs/'
    with open(path+name+'_'+time+'.txt','w') as f:
        for i in p:
            f.write("%s\n"%i)
    content = ''
    for items in data:
        if items['user']:
            content += name + ' : ' + (items['text']) + '\n'
        elif not items['options']:
            if not items['isAnswer']:
                content += 'BOT : ' + str(items['text']) + '\n'
            else:
                content += 'BOT : ' + str(items['title']) + '\n'
                #content += 'BOT : ' + str(items['body']) + '\n'
                #content += 'BOT : ' + str(items['link']) + '\n'
    filename = name + '-chat.txt'
    response = HttpResponse(content, content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename={0}'.format(filename)
    return response


def createLog(request):
    name = request.session['username']
    data = json.loads(request.read())
    content = ''
    for items in data:
        if items['user']:
            content += name + ' : ' + (items['text']) + '\n'
        elif not items['options']:
            if not items['isAnswer']:
                content += 'BOT : ' + str(items['text']) + '\n'
            else:
                content += 'BOT : ' + str(items['title']) + '\n'
                #content += 'BOT : ' + str(items['body']) + '\n'
                #content += 'BOT : ' + str(items['link']) + '\n'
    filename = name + '-chat.txt'
    response = HttpResponse(content, content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename={0}'.format(filename)
    return response


def thankyou(request):
    try:
        context = {'name': request.session['username']}
        del request.session['username']
        return render(request, 'thankyou.html', context)
    except:
        return HttpResponse(
            """You are logged out. Please login to continue. 
            <a href='https://faq-bot-django.herokuapp.com'>Please login..</a>""")



def download(request):
# fill these variables with real values
    fl_path = '/Users/sunilhariharan/Workspace/faq-bot/faq8/templates/sublime.exe'
    filename = 'sublime.exe'

    fl = open(fl_path, 'rb')
    mime_type, _ = mimetypes.guess_type(fl_path)
    response = HttpResponse(fl, content_type=mime_type)
    response['Content-Disposition'] = "attachment; filename=%s" % filename
    return response
