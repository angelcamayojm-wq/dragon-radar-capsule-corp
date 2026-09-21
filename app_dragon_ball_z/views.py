from django.shortcuts import render

def radar_view(request):
    context = {
        'fondo_video': '/media/Fondo.mp4',
        'fondo_radar_img': '/media/fondo_radar.webp',
        'video_url': '/media/local.mp4',
        'audio_url': '/media/local.mp3',
        'pdf_url': '/media/manual_capsule.pdf', # <-- Nombre exacto del archivo
    }
    return render(request, 'app_dragon_ball_z/radar.html', context)