<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>АкваДозор Актау — сообщи об утечке воды</title>
<meta name="description" content="Прототип сервиса для жителей Актау: сообщайте об утечках воды с фото и картой, ИИ оценивает риск, диспетчер видит заявку мгновенно." />

<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💧</text></svg>" />

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<link rel="stylesheet" href="css/style.css" />
</head>
<body>

<header class="navbar">
  <div class="nav-inner">
    <div class="logo" data-view-link="home">
      <span class="logo-emoji">💧</span>
      <span>АкваДозор <em>Актау</em></span>
    </div>
    <button class="nav-toggle" id="navToggle" aria-label="Меню">☰</button>
    <nav id="navMenu">
      <button class="nav-btn" data-view-link="home">Главная</button>
      <button class="nav-btn" data-view-link="report">Сообщить об утечке</button>
      <button class="nav-btn" data-view-link="tracker">Мои заявки</button>
      <button class="nav-btn" data-view-link="admin">Панель диспетчера</button>
    </nav>
  </div>
</header>

<main id="app">

  <!-- ===================== HOME ===================== -->
  <section id="view-home" class="view">
    <div class="hero">
      <div class="hero-inner">
        <span class="pill">Кейс: Приложение для утечек воды в Актау</span>
        <h1>25–30% воды в Актау теряется впустую <span class="accent">до того, как кто-то это заметит</span></h1>
        <p class="hero-text">Опреснённая вода в Актау — дорогой ресурс. АкваДозор позволяет любому жителю за 1 минуту сообщить об утечке с фото, точкой на карте и описанием — а ИИ сразу оценивает, насколько это серьёзно, и передаёт заявку ответственным службам.</p>
        <div class="hero-actions">
          <button class="btn btn-accent btn-lg" data-view-link="report">💧 Сообщить об утечке</button>
          <button class="btn btn-ghost btn-lg" data-view-link="tracker">Отследить заявку</button>
        </div>
      </div>
    </div>

    <div class="section-block">
      <h2>Как это работает</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">1</div>
          <h3>📷 Фото и точка на карте</h3>
          <p>Сфотографируйте лужу или повреждение и отметьте место на карте города — даже если это не дом, а точка посреди улицы.</p>
        </div>
        <div class="step-card">
          <div class="step-num">2</div>
          <h3>🤖 Оценка ИИ</h3>
          <p>Система анализирует фото и описание: определяет вероятность реальной утечки и её опасность — лёгкая, средняя или сложная.</p>
        </div>
        <div class="step-card">
          <div class="step-num">3</div>
          <h3>📨 Заявка диспетчеру</h3>
          <p>Готовая заявка с фото, адресом, описанием и контактами автоматически уходит ответственным службам — и вы видите её статус.</p>
        </div>
        <div class="step-card">
          <div class="step-num">4</div>
          <h3>🎁 Бонус к оплате</h3>
          <p>За подтверждённую помощь в поиске утечек — скидка до 5% на оплату коммунальных услуг в текущем месяце.</p>
        </div>
      </div>
    </div>

    <div class="section-block stats-block">
      <div class="stat"><div class="stat-num" id="statTotal">0</div><div class="stat-label">заявок подано</div></div>
      <div class="stat"><div class="stat-num" id="statConfirmed">0</div><div class="stat-label">подтверждено ИИ</div></div>
      <div class="stat"><div class="stat-num" id="statDone">0</div><div class="stat-label">устранено</div></div>
      <div class="stat"><div class="stat-num">25–30%</div><div class="stat-label">теряется впустую сейчас</div></div>
    </div>
  </section>

  <!-- ===================== REPORT FORM ===================== -->
  <section id="view-report" class="view">
    <div class="page-head">
      <h1>Сообщить об утечке</h1>
      <p>Заполните форму — это займёт около минуты. Поля со звёздочкой обязательны.</p>
    </div>

    <form id="reportForm" class="report-form">

      <div class="form-card">
        <h2>1. Фото утечки *</h2>
        <p class="hint">Сфотографируйте лужу, повреждение трубы или мокрый участок.</p>

        <div class="camera-box">
          <video id="cameraVideo" playsinline autoplay muted hidden></video>
          <canvas id="cameraCanvas" hidden></canvas>
          <img id="photoPreview" alt="Превью фото" hidden />
          <div id="photoPlaceholder" class="photo-placeholder">Фото ещё не добавлено</div>
        </div>

        <div class="camera-controls">
          <button type="button" class="btn btn-secondary" id="btnOpenCamera">📷 Открыть камеру</button>
          <button type="button" class="btn btn-accent" id="btnCapture" hidden>✅ Сделать снимок</button>
          <button type="button" class="btn btn-ghost" id="btnRetake" hidden>↺ Переснять</button>
          <label class="btn btn-secondary file-label">
            📁 Загрузить файл
            <input type="file" id="fileInput" accept="image/*" capture="environment" hidden />
          </label>
        </div>
        <p class="camera-error" id="cameraError" hidden></p>
      </div>

      <div class="form-card">
        <h2>2. Адрес / место на карте *</h2>
        <p class="hint">Кликните на карте, чтобы отметить место — подходит и для точки посреди улицы, не только для дома.</p>
        <div id="map"></div>
        <input type="text" id="addressText" placeholder="Адрес (заполнится автоматически или впишите вручную)" required />
      </div>

      <div class="form-card">
        <h2>3. Описание проблемы *</h2>
        <p class="hint">Опишите, что видите и чем это грозит — это помогает ИИ точнее оценить опасность.</p>
        <textarea id="description" rows="4" maxlength="500" placeholder="Например: из-под асфальта на перекрёстке бьёт вода уже второй день, образовалась большая лужа и течёт к дороге..." required></textarea>
        <div class="char-counter"><span id="charCount">0</span>/500</div>
      </div>

      <div class="form-card">
        <h2>4. Ваши контакты *</h2>
        <p class="hint">Нужны, чтобы отслеживать заявку и начислить бонус за помощь.</p>
        <div class="form-row">
          <div class="form-field">
            <label for="fio">ФИО</label>
            <input type="text" id="fio" placeholder="Иванов Иван Иванович" required />
          </div>
          <div class="form-field">
            <label for="phone">Номер телефона</label>
            <input type="tel" id="phone" placeholder="+7 7XX XXX XX XX" required />
          </div>
        </div>
      </div>

      <div class="form-card ai-card">
        <h2>5. Оценка ИИ</h2>
        <p class="hint">Запускается автоматически при добавлении фото. При необходимости можно пересчитать.</p>
        <button type="button" class="btn btn-secondary" id="btnRunAI">🤖 Проверить с помощью ИИ</button>
        <div id="aiResult" class="ai-result" hidden>
          <div class="ai-row">
            <span>Вероятность реальной утечки</span>
            <div class="bar"><div class="bar-fill" id="aiProbFill"></div></div>
            <span id="aiProbValue">0%</span>
          </div>
          <div class="ai-row">
            <span>Оценка опасности</span>
            <span id="aiSeverityBadge" class="badge">—</span>
          </div>
          <p class="ai-summary" id="aiSummary"></p>
        </div>
      </div>

      <button type="submit" class="btn btn-accent btn-lg btn-submit">📨 Отправить заявку</button>
    </form>
  </section>

  <!-- ===================== TRACKER ===================== -->
  <section id="view-tracker" class="view">
    <div class="page-head">
      <h1>Мои заявки</h1>
      <p>Введите номер телефона, который указывали при отправке, чтобы увидеть статус ваших заявок.</p>
    </div>

    <div class="tracker-lookup">
      <input type="tel" id="trackerPhone" placeholder="+7 7XX XXX XX XX" />
      <button class="btn btn-accent" id="btnLookup">Найти мои заявки</button>
    </div>

    <div class="bonus-box" id="bonusBox" hidden>
      <div class="bonus-title">🎁 Ваша скидка на коммунальные услуги в этом месяце</div>
      <div class="bar bar-lg"><div class="bar-fill accent" id="bonusFill"></div></div>
      <div class="bonus-value"><span id="bonusValue">0</span>% из максимальных 5%</div>
      <p class="hint">Скидка начисляется за заявки, которые ИИ подтвердил как реальную утечку, и списывается каждый месяц — накопить её на будущее нельзя.</p>
    </div>

    <div id="trackerList" class="report-list"></div>
  </section>

  <!-- ===================== ADMIN ===================== -->
  <section id="view-admin" class="view">
    <div class="page-head">
      <h1>Панель диспетчера</h1>
      <p>Все поступившие заявки, отсортированные по опасности. Здесь ответственные службы меняют статус работ.</p>
    </div>

    <div class="admin-stats">
      <div class="admin-stat"><span id="adminTotal">0</span><small>всего заявок</small></div>
      <div class="admin-stat sev-hard"><span id="adminHard">0</span><small>сложные</small></div>
      <div class="admin-stat sev-medium"><span id="adminMedium">0</span><small>средние</small></div>
      <div class="admin-stat sev-light"><span id="adminLight">0</span><small>лёгкие</small></div>
    </div>

    <div class="admin-filters">
      <select id="filterStatus">
        <option value="all">Все статусы</option>
        <option value="new">На рассмотрении</option>
        <option value="in_progress">В процессе</option>
        <option value="done">Завершено</option>
      </select>
      <select id="filterSort">
        <option value="severity">Сначала опасные</option>
        <option value="new">Сначала новые</option>
      </select>
    </div>

    <div id="adminList" class="admin-list"></div>
  </section>

</main>

<div id="toastContainer" class="toast-container"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="js/storage.js"></script>
<script src="js/ai.js"></script>
<script src="js/camera.js"></script>
<script src="js/map.js"></script>
<script src="js/app.js"></script>
</body>
</html>
