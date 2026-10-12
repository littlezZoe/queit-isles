#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静屿 QUIET ISLES — 静态页面生成器

用法：
    python3 tools/build_pages.py

会从 assets/scenes.js 里解析 SCENES 场景清单，
然后在 quiet-isles/ 目录下生成：
    index.html            首页（落地页）
    scenes.html           场景总览
    journal.html          生命图鉴
    about.html            关于
    scene-<id>.html ×9    每个场景一个独立页面

改完 scenes.js 后重跑本脚本即可同步页面。
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENES_JS = os.path.join(ROOT, 'assets', 'scenes.js')

PAT = re.compile(
    r"\{id:'(?P<id>[^']+)',no:'(?P<no>[^']+)',en:'(?P<en>[^']+)',cn:'(?P<cn>[^']+)',"
    r"sub:'(?P<sub>[^']+)',\s*desc:'(?P<desc>[^']+)',\s*accent:'(?P<accent>[^']+)',"
    r"mood:'(?P<mood>[^']+)',"
)


def load_scenes():
    src = open(SCENES_JS, encoding='utf-8').read()
    out = []
    for m in PAT.finditer(src):
        out.append(m.groupdict())
    if not out:
        sys.exit('!! 没能从 %s 解析出场景清单' % SCENES_JS)
    return out


NAV = '''<header class="nav">
  <div class="in">
    <a class="brand" href="index.html">
      <span class="mk">◍</span>
      <span class="tx"><b>静屿</b><small>QUIET ISLES</small></span>
    </a>
    <nav class="links">
      <a href="index.html" data-nav="index.html">首页</a>
      <a href="scenes.html" data-nav="scenes.html">场景</a>
      <a href="journal.html" data-nav="journal.html">生命图鉴</a>
      <a href="about.html" data-nav="about.html">关于</a>
    </nav>
  </div>
</header>'''

FOOT = '''<footer class="ft">
  <div>静屿 QUIET ISLES · 九个不催你的小世界</div>
  <div class="fl">
    <a href="scenes.html">场景总览</a>
    <a href="journal.html">生命图鉴</a>
    <a href="about.html">关于</a>
  </div>
  <div>音景由浏览器实时合成 · 无需下载 · 进度存在本机</div>
</footer>'''

HEAD = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="p-site" data-page="__PAGE__">
<div id="boot"><div><div class="k">QUIET ISLES<br>静屿</div><div class="c"></div></div></div>
__BODY__
<script src="assets/engine.js"></script>
<script src="assets/audio.js"></script>
<script src="assets/scenes.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
'''

PLAY_HEAD = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="p-play" data-page="player" data-scene="__SID__">
<div id="boot"><div><div class="k">QUIET ISLES<br>静屿</div><div class="c"></div></div></div>
__BODY__
<script src="assets/engine.js"></script>
<script src="assets/audio.js"></script>
<script src="assets/scenes.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
'''


def page(title, desc, page_id, body):
    return (HEAD.replace('__TITLE__', title)
                .replace('__DESC__', desc)
                .replace('__PAGE__', page_id)
                .replace('__BODY__', body))


def play_page(title, desc, sid, body):
    return (PLAY_HEAD.replace('__TITLE__', title)
                    .replace('__DESC__', desc)
                    .replace('__SID__', sid)
                    .replace('__BODY__', body))


# --------------------------------------------------------------------------
# 首页
# --------------------------------------------------------------------------
FEATS = [
    ('🖱', '任何角度都行', '拖一下转一圈，滚轮拉近拉远。天上、侧面、贴着地面看 —— 每个角度都是重新画过的，不是照片。'),
    ('🔊', '声音是现算的', '海浪、雨、溪水、柴火、虫鸣，全部由浏览器实时合成，一个音频文件都没有。戴上耳机差别很大。'),
    ('👆', '只做很小的事', '捡一片碎片、点亮一盏灯、敲一根竹筒。没有倒计时，没有分数，做不做都行。'),
    ('🐾', '顺手记进图鉴', '每个场景都住着几只小东西。轻轻点一下它，就会记进《生命图鉴》，一共能集齐一堆。'),
]

STEPS = [
    ('STEP 1', '挑一个场景', '九个场景，海边的、山里的、云上的、雨夜的，随便挑一个进去。'),
    ('STEP 2', '转一转、凑近看', '按住拖动换角度，滚轮缩放。想回到最初的样子，双击画面或者按 R。'),
    ('STEP 3', '顺手做件小事', '屏幕下面那行字会告诉你这里能做什么。做完会有小小的回报。'),
    ('STEP 4', '点点小动物', '看到会动的小家伙就点一下，它会被记进图鉴。集满之后图鉴页会很好看。'),
]


def build_index(scenes):
    feats = '\n'.join(
        '      <div class="feat"><div class="ic">%s</div><h3>%s</h3><p>%s</p></div>' % f
        for f in FEATS)
    steps = '\n'.join(
        '      <div class="step"><b>%s</b><strong>%s</strong><p>%s</p></div>' % s
        for s in STEPS)
    body = NAV + '''

<main>
  <section class="hero">
    <div>
      <div class="kicker">QUIET ISLES · 静屿</div>
      <h1>把一个小小世界，<br><em>放在手心里慢慢看。</em></h1>
      <p class="lede">九个巴掌大的小天地。拖一拖，转一转，凑近看清一滴水、一片叶子、一只在打盹的小家伙。<br>
        没有输赢，也不会催你 —— <b>就安安静静待着，顺便做一件很小的事。</b></p>
      <div class="act">
        <a class="btn dark" id="btnContinue" href="scenes.html">开始逛 →</a>
        <a class="btn line" href="journal.html">看看生命图鉴</a>
        <span class="subttl" data-stat="pets"></span>
      </div>
    </div>
    <div class="hcanvas">
      <canvas id="heroCanvas"></canvas>
      <div class="heroCap" id="heroCap">01 · 潮汐之庭</div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-h">
      <div class="kicker">WHY IT FEELS NICE</div>
      <h2>为什么它看着舒服</h2>
      <p>这里没有关卡、没有排行榜、也没有「你今天还没玩」。只是个可以随便待着的地方。</p>
    </div>
    <div class="feats">
''' + feats + '''
    </div>
  </section>

  <section class="sec">
    <div class="sec-h">
      <div class="kicker">NINE LITTLE WORLDS</div>
      <h2>九个场景，九个心情</h2>
      <p>从清晨的海岸一直到雨夜的天台。每个场景有自己的一整套声音和一件小事。</p>
    </div>
    <div class="wall" id="wall"></div>
    <div style="margin-top:26px"><a class="btn dark" href="scenes.html">看看全部九个 →</a></div>
  </section>

  <section class="sec">
    <div class="sec-h">
      <div class="kicker">HOW TO PLAY</div>
      <h2>怎么玩</h2>
      <p>真的没什么规则，四步就够了。</p>
    </div>
    <div class="steps">
''' + steps + '''
    </div>
  </section>

  <section class="sec">
    <div class="sec-h">
      <div class="kicker">YOUR PROGRESS</div>
      <h2>你记录了什么</h2>
      <p>进度存在你自己的浏览器里，不上传、不联网、换台电脑就从头开始。</p>
    </div>
    <div class="statrow">
      <div class="stat"><b data-stat="pets"></b><span>已记录小居民</span></div>
      <div class="stat"><b data-stat="tasks"></b><span>已完成小任务</span></div>
      <div class="stat"><b>9</b><span>个场景</span></div>
    </div>
  </section>

  <section class="cta">
    <div class="ctabox">
      <div>
        <h2>挑一个，就现在。</h2>
        <p>不用挑「最好的那个」—— 每个场景都差不多安静。</p>
      </div>
      <div class="cact">
        <a class="btn light" href="scenes.html">进入场景总览</a>
        <a class="btn ghost" href="about.html">关于这个网站</a>
      </div>
    </div>
  </section>
</main>

''' + FOOT
    return page('静屿 QUIET ISLES · 九个治愈系小世界',
                '静屿 QUIET ISLES —— 九个可以任意旋转缩放的治愈系 3D 小场景，每个场景配自己的环境音和一件小小的互动。',
                'landing', body)


# --------------------------------------------------------------------------
# 场景总览
# --------------------------------------------------------------------------
def build_scenes(scenes):
    body = NAV + '''

<main class="page">
  <div class="kicker">SCENES</div>
  <h1>九个场景，<em>随便挑一个。</em></h1>
  <p class="pd">每一个都是独立的一页。进去之后拖拽旋转、滚轮缩放，点一点画面里的东西，它会回应你。
    下面灰色的字是每个场景里等着你的那件小事。</p>
  <div class="statrow">
    <div class="stat"><b>9</b><span>个场景</span></div>
    <div class="stat"><b data-stat="tasks"></b><span>已完成</span></div>
    <div class="stat"><b data-stat="pets"></b><span>已记录小居民</span></div>
  </div>
</main>

<section class="sec" style="padding-top:clamp(30px,4vw,48px)">
  <div class="grid" id="grid"></div>
</section>

<section class="cta">
  <div class="ctabox">
    <div>
      <h2>还在犹豫先去哪？</h2>
      <p>第一次来的话，建议从 01 潮汐之庭开始 —— 那是最好懂的一个。</p>
    </div>
    <div class="cact">
      <a class="btn light" href="scene-tidal.html">去 01 潮汐之庭</a>
      <a class="btn ghost" href="journal.html">先看看图鉴</a>
    </div>
  </div>
</section>

''' + FOOT
    return page('场景总览 · 静屿 QUIET ISLES',
                '静屿的九个场景：潮汐之庭、暖屿、苔林微光、雪见小屋、星沉小池、云上梯田、沙漠绿洲、竹海小径、雨夜天台。',
                'scenes', body)


# --------------------------------------------------------------------------
# 图鉴
# --------------------------------------------------------------------------
def build_journal(scenes):
    body = NAV + '''

<main class="page">
  <div class="kicker">LIFE JOURNAL</div>
  <h1>生命图鉴</h1>
  <p class="pd">每个场景里都住着几只小东西。看到会动的、会眨眼的那种，轻轻点一下它，
    就会被记进这里。没找到的会显示成「？？？」，不着急，慢慢来。</p>
  <div class="statrow">
    <div class="stat"><b data-stat="pets"></b><span>已记录</span></div>
    <div class="stat"><b>9</b><span>个场景</span></div>
    <div class="stat"><b data-stat="tasks"></b><span>已完成小任务</span></div>
  </div>
</main>

<section class="sec" style="padding-top:clamp(24px,3vw,40px)">
  <div class="chips" id="jfilter"></div>
  <div class="jstat" id="j-stat"></div>
  <div class="jgrid jgrid2" id="jgrid"></div>
  <div class="emptybox" id="j-empty">
    图鉴还是空的。随便进一个场景，点一下会动的小家伙 —— 它就会出现在这里。
    <div style="margin-top:16px"><a class="btn dark" href="scenes.html">去场景总览</a></div>
  </div>
</section>

''' + FOOT
    return page('生命图鉴 · 静屿 QUIET ISLES',
                '静屿的生命图鉴：记录你在九个场景里遇到的每一只小居民。',
                'journal', body)


# --------------------------------------------------------------------------
# 关于
# --------------------------------------------------------------------------
def build_about(scenes):
    rows = '\n'.join(
        '      <a class="tile" href="scene-%s.html" style="--accent:%s">'
        '<div class="tmeta" style="padding:16px 16px 18px">'
        '<span class="tno">%s</span><span class="tcn">%s</span>'
        '<span class="ten">%s</span></div></a>' % (s['id'], s['accent'], s['no'], s['cn'], s['en'])
        for s in scenes)
    body = NAV + '''

<main class="page">
  <div class="kicker">ABOUT</div>
  <h1>关于静屿</h1>
  <p class="pd">静屿是一个纯前端的小网站 —— 没有后台、没有账号、没有广告、也不会推送任何东西。
    打开就是一整个世界，关掉它就安静地待在那儿。</p>
  <div class="statrow">
    <div class="stat"><b>9</b><span>个场景</span></div>
    <div class="stat"><b>0</b><span>个外部依赖</span></div>
    <div class="stat"><b data-stat="pets"></b><span>已记录小居民</span></div>
  </div>
</main>

<section class="sec">
  <div class="sec-h">
    <div class="kicker">UNDER THE HOOD</div>
    <h2>它是怎么做出来的</h2>
    <p>整个网站没有一个 3D 库、没有一张贴图、也没有一个音频文件。</p>
  </div>
  <div class="feats">
    <div class="feat"><div class="ic">△</div><h3>手写的软 3D</h3>
      <p>所有场景都是几百个平面多边形，用 Canvas 2D 一个一个算出来再着色。所以它很轻，手机也能跑。</p></div>
    <div class="feat"><div class="ic">≈</div><h3>声音是算出来的</h3>
      <p>海浪是一段被滤波的白噪声加一个慢波，虫鸣是一条方波在调制带通滤波。全部实时合成。</p></div>
    <div class="feat"><div class="ic">◻</div><h3>九个独立页面</h3>
      <p>每个场景都是自己的一页，共用同一套引擎和音景。改一个场景不会影响别的场景。</p></div>
    <div class="feat"><div class="ic">⌂</div><h3>进度只在本机</h3>
      <p>你记下的图鉴和完成的小任务，都藏在浏览器的 localStorage 里。清缓存就清零 —— 本来就是玩玩的。</p></div>
  </div>
</section>

<section class="sec">
  <div class="sec-h">
    <div class="kicker">THE NINE</div>
    <h2>九个场景</h2>
    <p>按顺序是这么排的。</p>
  </div>
  <div class="wall" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
''' + rows + '''
  </div>
</section>

<section class="cta">
  <div class="ctabox">
    <div>
      <h2>好了，去待一会儿吧。</h2>
      <p>建议戴耳机。</p>
    </div>
    <div class="cact"><a class="btn light" href="scenes.html">进入场景总览</a></div>
  </div>
</section>

''' + FOOT
    return page('关于 · 静屿 QUIET ISLES',
                '静屿是一个纯前端的治愈系小场景网站：手写软 3D、程序化音景、零外部依赖、进度只存在本机。',
                'about', body)


# --------------------------------------------------------------------------
# 场景播放页
# --------------------------------------------------------------------------
def build_scene_page(scenes, idx):
    s = scenes[idx]
    prev = scenes[(idx - 1) % len(scenes)]
    nxt = scenes[(idx + 1) % len(scenes)]
    body = '''
<div id="stage">
  <canvas id="cv"></canvas>
  <div class="vig"></div>

  <div class="topbar">
    <a class="backbtn" href="scenes.html">← 回到场景列表</a>
    <div class="scenelabel">
      <div class="k" id="sl-k">__NO__ / __EN__</div>
      <div class="n"><span id="sl-n">__CN__</span><small id="sl-s">__SUB__</small></div>
    </div>
    <div class="tools">
      <button class="tool" id="btnDay" title="白天 / 夜晚"><span id="icoDay">🌙</span></button>
      <button class="tool" id="btnOrbit" title="自动旋转"><span>⟳</span></button>
      <button class="tool" id="btnSound" title="音景开关"><span id="icoSound">🔈</span></button>
      <button class="tool" id="btnBook" title="快速看图鉴"><span>🐾</span></button>
      <a class="tool" href="journal.html" title="打开完整图鉴"><span>📖</span></a>
      <button class="tool" id="btnReset" title="复位视角（R）"><span>⤾</span></button>
    </div>
  </div>

  <div class="hint" id="hint">拖拽旋转 · 滚轮缩放 · 点一下小东西试试</div>

  <a class="corner l" id="btnPrev" href="scene-__PID__.html" title="上一个：__PCN__">←</a>
  <a class="corner r" id="btnNext" href="scene-__NID__.html" title="下一个：__NCN__">→</a>

  <div class="petcard" id="petcard">
    <div class="k" id="pc-k">MEET THE LOCALS</div>
    <div class="n"><span id="pc-n">寄居蟹</span><small id="pc-e">Hermit Crab</small></div>
    <div class="d" id="pc-d"></div>
    <div class="b" id="pc-b"><span>✓</span><span>已记进生命图鉴</span></div>
  </div>

  <div class="taskbar" id="taskbar">
    <span class="dot"></span>
    <span class="txt"><span id="tk-t">正在做一件小事</span><small id="tk-s"></small></span>
    <span class="bar"><i id="tk-b"></i></span>
  </div>

  <div class="toast" id="toast"></div>

  <div class="sheet" id="journal">
    <div class="hd">
      <div class="t"><small>LIFE JOURNAL</small>生命图鉴 <span class="sc" id="j-sc"></span></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <a class="backbtn" href="journal.html">完整图鉴 →</a>
        <button class="backbtn" id="btnBookClose">收起 ✕</button>
      </div>
    </div>
    <div class="bd">
      <p class="scenedesc" id="scene-desc"></p>
      <div class="jgrid" id="jgrid"></div>
    </div>
  </div>
</div>
'''.replace('__NO__', s['no']).replace('__EN__', s['en']) \
   .replace('__CN__', s['cn']).replace('__SUB__', s['sub']) \
   .replace('__PID__', prev['id']).replace('__PCN__', prev['cn']) \
   .replace('__NID__', nxt['id']).replace('__NCN__', nxt['cn'])
    title = '%s %s · %s — 静屿 QUIET ISLES' % (s['no'], s['cn'], s['en'])
    desc = '%s %s —— %s' % (s['cn'], s['en'], s['desc'])
    return play_page(title, desc, s['id'], body)


def main():
    scenes = load_scenes()
    print('解析到 %d 个场景：%s' % (len(scenes), '、'.join(s['cn'] for s in scenes)))

    files = {
        'index.html': build_index(scenes),
        'scenes.html': build_scenes(scenes),
        'journal.html': build_journal(scenes),
        'about.html': build_about(scenes),
    }
    for i, s in enumerate(scenes):
        files['scene-%s.html' % s['id']] = build_scene_page(scenes, i)

    for name, html in files.items():
        with open(os.path.join(ROOT, name), 'w', encoding='utf-8') as f:
            f.write(html)
        print('  √ %-22s %6d B' % (name, len(html.encode('utf-8'))))
    print('完成，共 %d 个页面。' % len(files))


if __name__ == '__main__':
    main()
