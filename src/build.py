"""Сборка сайта в один файл.
   python3 src/build.py                       → mikromir.html и index.html рядом с папкой src
   python3 src/build.py --url https://ИМЯ.github.io/mikromir/
                                              → то же + QR-код на этот адрес внизу страницы и файл qr.svg
   Для QR нужен пакет qrcode: pip install qrcode"""
import os, sys, subprocess, base64
os.chdir(os.path.dirname(os.path.abspath(__file__)))
url=None
if '--url' in sys.argv: url=sys.argv[sys.argv.index('--url')+1]
subprocess.check_call([sys.executable,'track.py'])
A=open('model.js',encoding='utf-8').read()
B=open('stage.js',encoding='utf-8').read()
photo=base64.b64encode(open('suit.jpg','rb').read()).decode()
def svg(inner): return '<svg viewBox="0 0 48 48" aria-hidden="true">'+inner+'</svg>'
IC={
"cam":svg('<rect x="6" y="14" width="30" height="22" rx="3"/><circle cx="21" cy="25" r="7"/><circle cx="21" cy="25" r="2.5"/><path d="M36 21l7-4v16l-7-4z"/>'),
"pose":svg('<circle cx="24" cy="9" r="4"/><path d="M24 13v14M24 17l-9 6M24 17l9 6M24 27l-7 15M24 27l7 15"/><circle cx="15" cy="23" r="1.4"/><circle cx="33" cy="23" r="1.4"/><circle cx="17" cy="42" r="1.4"/><circle cx="31" cy="42" r="1.4"/>'),
"db":svg('<ellipse cx="24" cy="11" rx="15" ry="5"/><path d="M9 11v26c0 3 7 5 15 5s15-2 15-5V11M9 24c0 3 7 5 15 5s15-2 15-5"/>'),
"model":svg('<circle cx="14" cy="16" r="6"/><circle cx="35" cy="14" r="5"/><circle cx="24" cy="35" r="8"/><path d="M19 18l11-3M17 21l5 8M32 18l-6 10" stroke-dasharray="2 3"/>'),
"td":svg('<rect x="4" y="8" width="14" height="10" rx="2"/><rect x="30" y="8" width="14" height="10" rx="2"/><rect x="17" y="30" width="14" height="10" rx="2"/><path d="M18 13h12M11 18v6h13v6M37 18v6H24"/>'),
"suit":svg('<path d="M17 5l-11 8 5 7 5-3v26h16V17l5 3 5-7-11-8c-2 4-6 4-7 4s-5 0-7-4z"/>'),
"esp":svg('<rect x="10" y="4" width="28" height="40" rx="3"/><rect x="17" y="12" width="14" height="14" rx="1.5"/><path d="M14 4v-2M20 4v-2M28 4v-2M34 4v-2M14 44v2M20 44v2M28 44v2M34 44v2M20 34h8M20 38h8"/>'),
"led":svg('<rect x="3" y="18" width="42" height="12" rx="3"/><circle cx="10" cy="24" r="2.6"/><circle cx="19" cy="24" r="2.6"/><circle cx="28" cy="24" r="2.6"/><circle cx="37" cy="24" r="2.6"/><path d="M10 12v-4M24 12V6M38 12V8"/>')}
def cp(k,name,model,role): return '<div class="cp">%s<div><b>%s</b>%s<span class="rl">%s</span></div></div>'%(IC[k],name,('<span class="md">%s</span>'%model) if model else '',role)
C={'cam':cp('cam','Умная камера','30 кадров в секунду','Снимает всех актёров над сценой'),
'pose':cp('pose','Трекинг','33 точки тела + датчики','Положение, движение, касания'),
'db':cp('db','База сценариев','Cell Tracking Challenge · TCGA · SEER · PhysiCell','Ветки развития болезни'),
'model':cp('model','Модель клеток','наш код','Раз в секунду сравнивает сцену с базой, 4 раза в секунду раздаёт условия'),
'td':cp('td','Пульт режиссёра','на развилках','Оставить ветку ИИ или выбрать свою'),
'suitc':cp('suit','Костюм','на основе Teslasuit','Вибрация, термопластины'),
'esp':cp('esp','Блок на поясе','20–50 пакетов в секунду','Принимает сигналы и плавно ведёт каналы'),
'led':cp('led','Светодиодная ткань','','Цвет: состояние клетки')}

qr=''
if url:
    try:
        import qrcode, qrcode.image.svg
        img=qrcode.make(url,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=1)
        s=img.to_string(encoding='unicode')
        open('../qr.svg','w',encoding='utf-8').write(s)
        s=s[s.index('<svg'):]
        qr='<div class="qr rv">%s<p>Откройте сайт на телефоне: наведите камеру на QR-код</p></div>'%s
        print('QR →',url)
    except ImportError:
        print('Пакет qrcode не найден: pip install qrcode. Сайт собран без QR.')

head=open('head.html',encoding='utf-8').read()
body=open('body.html',encoding='utf-8').read().replace('{{TRACK}}',open('track.html',encoding='utf-8').read())
for k,v in C.items(): body=body.replace('{{%s}}'%k,v)
body=body.replace('{{PHOTO}}',photo).replace('{{QR}}',qr)
assert '{{' not in body
ui=open('ui.js',encoding='utf-8').read()
out=head+body+'\n<script>\n(function(){\n"use strict";\n'+A+B+ui+'\n})();\n</script>\n</body>\n</html>\n'
for f in ('../mikromir.html','../index.html'): open(f,'w',encoding='utf-8').write(out)
print(len(out),'байт')
