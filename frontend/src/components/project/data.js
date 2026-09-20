export const demo_data = [
  {
    code: `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZincControl — Device Dashboard</title>

  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: { 850: '#1f1f22', 950: '#09090b' }
          },
          keyframes: {
            'fade-in': {
              '0%':   { opacity: '0', transform: 'translateY(4px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' }
            }
          },
          animation: { 'fade-in': 'fade-in .22s ease-out' }
        }
      }
    };
  </script>

  <style>
    .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #3f3f46; border-radius: 9999px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #52525b; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
    }
  </style>
</head>

<body class="h-screen bg-zinc-950 text-zinc-100 antialiased">
  <div class="flex h-full">

    <!-- ============ SIDEBAR ============ -->
    <aside class="h-full hidden w-64 shrink-0 flex-col gap-8 border-r border-zinc-800 bg-zinc-900/40 p-6 lg:flex">
      <div class="flex items-center gap-3">
        <div class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 font-bold text-white">Z</div>
        <span class="text-lg font-semibold tracking-tight">ZincControl</span>
      </div>

      <nav class="flex flex-col gap-1 text-sm">
        <a href="#" class="rounded-lg bg-zinc-800/70 px-3 py-2 font-medium text-zinc-100">Dashboard</a>
        <a href="#" class="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-zinc-100">Devices</a>
        <a href="#" class="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-zinc-100">Automations</a>
        <a href="#" class="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-zinc-100">Logs</a>
      </nav>

      <p class="mt-auto text-xs text-zinc-600">&copy; <span id="year"></span> ZincControl</p>
    </aside>

    <!-- ============ MAIN ============ -->
    <main class="flex min-w-0 flex-1 flex-col overflow-auto">

      <!-- Header -->
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-6 py-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Control Center</h1>
          <p class="mt-1 text-sm text-zinc-500">Manage connected devices and issue commands.</p>
        </div>

        <span class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Connection active
        </span>
      </header>

      <!-- Stat cards -->
      <section class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Device</p>
          <p class="mt-2 text-xl font-semibold">Node-01</p>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Uptime</p>
          <p class="mt-2 text-xl font-semibold text-sky-400">14h 22m</p>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Latency</p>
          <p class="mt-2 text-xl font-semibold text-amber-400">42 ms</p>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Last command</p>
          <p id="last-command" class="mt-2 truncate text-xl font-semibold text-zinc-400">—</p>
        </div>
      </section>

      <!-- Control buttons -->
      <section class="px-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Actions</h2>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button data-action="Deploy System" data-theme="emerald"
            class="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span> Deploy System
          </button>

          <button data-action="Start Engine" data-theme="sky"
            class="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-medium text-white shadow-lg shadow-sky-950/40 transition hover:bg-sky-500 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span> Start Engine
          </button>

          <button data-action="Calibrate Sensors" data-theme="amber"
            class="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-medium text-zinc-950 shadow-lg shadow-amber-950/40 transition hover:bg-amber-400 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-zinc-900/70"></span> Calibrate Sensors
          </button>

          <button data-action="Sync Data" data-theme="violet"
            class="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span> Sync Data
          </button>

          <button data-action="Reboot Node" data-theme="rose"
            class="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-medium text-white shadow-lg shadow-rose-950/40 transition hover:bg-rose-500 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span> Reboot Node
          </button>

          <button data-action="Run Diagnostics" data-theme="zinc"
            class="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-700 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
            <span class="h-1.5 w-1.5 rounded-full bg-zinc-400"></span> Run Diagnostics
          </button>
        </div>
      </section>

      <!-- Console -->
      <section class="p-6">
        <div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-rose-500/80"></span>
              <span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
              <span class="h-3 w-3 rounded-full bg-emerald-500/80"></span>
              <span class="ml-2 font-mono text-xs text-zinc-500">system.log</span>
            </div>
            <button id="clear-console"
              class="rounded-lg px-2.5 py-1 font-mono text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500">
              Clear
            </button>
          </div>

          <div id="console" aria-live="polite"
            class="scrollbar-thin h-64 space-y-1 overflow-y-auto p-4 font-mono text-sm text-zinc-300">
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    /* ---------- Theme map (explicit so Tailwind never purges them) ---------- */
    const THEMES = {
      emerald: 'text-emerald-400',
      sky:     'text-sky-400',
      amber:   'text-amber-400',
      violet:  'text-violet-400',
      rose:    'text-rose-400',
      zinc:    'text-zinc-300'
    };

    const MAX_ENTRIES = 100;

    const consoleEl  = document.getElementById('console');
    const lastCmdEl  = document.getElementById('last-command');

    /* ---------- Helpers ---------- */
    const escapeHtml = (str) =>
      String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));

    const timestamp = () =>
      new Date().toLocaleTimeString([], { hour12: false });

    /* ---------- Core logger ---------- */
    function log(message, options) {
      options = options || {};
      var theme = options.theme || 'zinc';
      var label = options.label || null;
      var color = THEMES[theme] || THEMES.zinc;

      var line = document.createElement('p');
      line.className = 'animate-fade-in leading-relaxed break-words';

      var html = '<span class="text-zinc-600">[' + timestamp() + ']</span> ' +
        '<span class="text-zinc-500">&gt;</span> ' +
        escapeHtml(message);

      if (label) {
        html += ' <span class="' + color + ' font-semibold">' + escapeHtml(label) + '</span>' +
          ' <span class="text-zinc-600">(' + escapeHtml(theme) + ' theme)</span>';
      }

      line.innerHTML = html;

      consoleEl.appendChild(line);

      // Trim old entries so the DOM never grows forever
      while (consoleEl.children.length > MAX_ENTRIES) {
        consoleEl.removeChild(consoleEl.firstElementChild);
      }

      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    /* ---------- Public command trigger (drop-in replacement) ---------- */
    function triggerCommand(commandName, themeColor) {
      themeColor = themeColor || 'zinc';
      log('Executed', { theme: themeColor, label: commandName });
      if (lastCmdEl) lastCmdEl.textContent = commandName;
    }
    // Backwards-compatible alias
    window.handleAction = triggerCommand;

    /* ---------- Event delegation (one listener, any number of buttons) ---------- */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      triggerCommand(btn.dataset.action, btn.dataset.theme);
    });

    /* ---------- Clear console ---------- */
    document.getElementById('clear-console').addEventListener('click', function () {
      consoleEl.innerHTML = '';
      log('Console cleared.');
    });

    /* ---------- Safe year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Boot ---------- */
    log('System initialized successfully.');
    log('System ready. Awaiting command.', { theme: 'emerald', label: 'ONLINE' });
  </script>
</body>
</html>
`,
    name: "best dashboard ui",
    user_id: 2,
    device_id: 1,
    connection: "active",
  }
];