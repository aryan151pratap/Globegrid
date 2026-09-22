import React from "react";
import {
  LuArrowRight as ArrowRight,
  LuCpu as Cpu,
  LuWifi as Wifi,
  LuActivity as Activity,
  LuTerminal as Terminal,
  LuShieldCheck as ShieldCheck,
  LuZap as Zap,
  LuCodeXml as Code2,
  LuRadio as Radio,
  LuBoxes as Boxes,
  LuGithub as Github,
} from "react-icons/lu";
import LandingBg from "./landing-bg";

export default function Landing() {
  return (
    <div className="iot-landing">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #030712;
          color: #f8fafc;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .iot-landing {
          min-height: 100vh;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(circle at 15% 20%, rgba(79, 70, 229, .13), transparent 28%),
            radial-gradient(circle at 85% 65%, rgba(6, 182, 212, .10), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(124, 58, 237, .09), transparent 30%),
            #030712;
        }

        .iot-content {
          position: relative;
          z-index: 2;
        }

        .iot-nav {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: auto;
          padding: 0 30px;
          border-bottom: 1px solid rgba(148, 163, 184, .08);
        }

        .iot-logo {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(90deg, #818cf8, #38bdf8, #22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .iot-logo span {
          color: #64748b;
          font-weight: 500;
        }

        .iot-nav-links {
          display: flex;
          align-items: center;
          gap: 38px;
        }

        .iot-nav-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          transition: .2s;
        }

        .iot-nav-links a:hover {
          color: white;
        }

        .iot-nav-btn {
          border: 0;
          background: #f8fafc;
          color: #020617;
          padding: 12px 21px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
        }

        .iot-nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 35px rgba(255,255,255,.12);
        }

        .iot-hero {
          max-width: 1150px;
          margin: auto;
          min-height: 850px;
          padding: 80px 25px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .iot-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 17px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, .15);
          background: rgba(15, 23, 42, .65);
          color: #a8b1c2;
          font-size: 14px;
          backdrop-filter: blur(15px);
          margin-bottom: 44px;
        }

        .iot-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 14px #34d399;
        }

        .iot-title {
          margin: 0;
          max-width: 1000px;
          font-size: clamp(62px, 9vw, 132px);
          line-height: .86;
          letter-spacing: -7px;
          font-weight: 950;
        }

        .iot-title-white {
          color: #f8fafc;
          display: block;
        }

        .iot-title-gradient {
          display: block;
          margin-top: 17px;
          background: linear-gradient(
            90deg,
            #818cf8 0%,
            #a78bfa 25%,
            #60a5fa 55%,
            #22d3ee 85%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .iot-description {
          max-width: 760px;
          margin: 42px auto 0;
          color: #9ca8ba;
          font-size: 19px;
          line-height: 1.6;
        }

        .iot-actions {
          display: flex;
          gap: 14px;
          margin-top: 36px;
        }

        .iot-primary,
        .iot-secondary {
          height: 56px;
          padding: 0 27px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s;
        }

        .iot-primary {
          border: 1px solid white;
          background: #f8fafc;
          color: #020617;
        }

        .iot-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255,255,255,.12);
        }

        .iot-secondary {
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(15,23,42,.65);
          color: #e2e8f0;
        }

        .iot-secondary:hover {
          border-color: rgba(129,140,248,.5);
          background: rgba(30,41,59,.7);
        }

        .iot-dashboard {
          width: min(920px, 94vw);
          margin-top: 76px;
          border: 1px solid rgba(148,163,184,.14);
          border-radius: 19px;
          background: rgba(5,10,23,.82);
          box-shadow:
            0 0 0 7px rgba(15,23,42,.35),
            0 25px 100px rgba(30,64,175,.14);
          overflow: hidden;
          text-align: left;
          backdrop-filter: blur(20px);
        }

        .iot-window-bar {
          height: 49px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 19px;
          border-bottom: 1px solid rgba(148,163,184,.08);
          background: rgba(2,6,23,.75);
        }

        .iot-window-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .iot-red {
          background: #ef4444;
        }

        .iot-yellow {
          background: #eab308;
        }

        .iot-green {
          background: #22c55e;
        }

        .iot-window-name {
          margin-left: 14px;
          color: #475569;
          font-size: 12px;
          font-family: monospace;
        }

        .iot-dashboard-body {
          display: grid;
          grid-template-columns: 190px 1fr;
          min-height: 330px;
        }

        .iot-sidebar {
          border-right: 1px solid rgba(148,163,184,.08);
          padding: 18px 13px;
          background: rgba(15,23,42,.28);
        }

        .iot-side-label {
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 10px 9px;
        }

        .iot-side-item {
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 10px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .iot-side-item.active {
          color: #c4b5fd;
          background: rgba(99,102,241,.11);
          border: 1px solid rgba(129,140,248,.10);
        }

        .iot-main-panel {
          padding: 24px;
        }

        .iot-panel-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .iot-panel-title {
          font-size: 17px;
          font-weight: 750;
        }

        .iot-live {
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4ade80;
        }

        .iot-live span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 10px #4ade80;
        }

        .iot-devices {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .iot-device-card {
          min-height: 120px;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,.10);
          background: rgba(15,23,42,.58);
          padding: 15px;
          transition: .2s;
        }

        .iot-device-card:hover {
          transform: translateY(-3px);
          border-color: rgba(96,165,250,.3);
        }

        .iot-device-icon {
          width: 33px;
          height: 33px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,.13);
          color: #818cf8;
          margin-bottom: 12px;
        }

        .iot-device-name {
          font-size: 12px;
          font-weight: 700;
        }

        .iot-device-meta {
          color: #64748b;
          font-size: 9px;
          margin-top: 5px;
        }

        .iot-device-status {
          margin-top: 12px;
          font-size: 9px;
          color: #4ade80;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .iot-device-status span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ade80;
        }

        .iot-features {
          max-width: 1150px;
          margin: 0 auto;
          padding: 70px 25px 120px;
        }

        .iot-section-label {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 18px;
        }

        .iot-section-title {
          text-align: center;
          font-size: 44px;
          letter-spacing: -2px;
          margin: 0 0 55px;
        }

        .iot-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .iot-feature {
          min-height: 220px;
          border: 1px solid rgba(148,163,184,.10);
          border-radius: 18px;
          padding: 25px;
          background: rgba(15,23,42,.38);
          transition: .25s;
        }

        .iot-feature:hover {
          transform: translateY(-5px);
          border-color: rgba(129,140,248,.25);
          background: rgba(15,23,42,.58);
        }

        .iot-feature-icon {
          width: 43px;
          height: 43px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,.12);
          color: #818cf8;
          margin-bottom: 24px;
        }

        .iot-feature:nth-child(2) .iot-feature-icon {
          background: rgba(6,182,212,.11);
          color: #22d3ee;
        }

        .iot-feature:nth-child(3) .iot-feature-icon {
          background: rgba(59,130,246,.11);
          color: #60a5fa;
        }

        .iot-feature h3 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .iot-feature p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
        }

        .iot-footer {
          border-top: 1px solid rgba(148,163,184,.08);
          padding: 28px;
          text-align: center;
          color: #475569;
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .iot-nav-links {
            display: none;
          }

          .iot-nav {
            padding: 0 18px;
          }

          .iot-hero {
            padding-top: 60px;
          }

          .iot-title {
            font-size: clamp(55px, 17vw, 90px);
            letter-spacing: -4px;
          }

          .iot-description {
            font-size: 16px;
          }

          .iot-dashboard-body {
            grid-template-columns: 1fr;
          }

          .iot-sidebar {
            display: none;
          }

          .iot-devices {
            grid-template-columns: 1fr;
          }

          .iot-feature-grid {
            grid-template-columns: 1fr;
          }

          .iot-section-title {
            font-size: 34px;
          }
        }

        @media (max-width: 500px) {
          .iot-actions {
            flex-direction: column;
            width: 100%;
          }

          .iot-primary,
          .iot-secondary {
            width: 100%;
          }

          .iot-hero {
            padding-left: 18px;
            padding-right: 18px;
          }
        }
      `}</style>

      <LandingBg />

      <div className="iot-content">
        <nav className="iot-nav">
          <div className="iot-logo">
            IOT<span>.DEV</span>
          </div>

          <div className="iot-nav-links">
            <a href="/devices">Devices</a>
            <a href="/features">Features</a>
            <a href="/inventory">Inventory</a>
            <a href="/docs">Docs</a>
          </div>

          <button className="iot-nav-btn">
            Open Manager
          </button>
        </nav>

        <main>
          <section className="iot-hero">
            <div className="iot-status">
              <span className="iot-status-dot" />
              Device network operational
            </div>

            <h1 className="iot-title">
              <span className="iot-title-white">
                CONTROL
              </span>

              <span className="iot-title-gradient">
                YOUR DEVICES.
              </span>
            </h1>

            <p className="iot-description">
              A modern IoT device manager for connecting, monitoring,
              debugging and controlling your ESP32 devices from one
              intelligent developer platform.
            </p>

            <div className="iot-actions">
              <button className="iot-primary">
                Launch Manager
                <ArrowRight size={17} />
              </button>

              <button className="iot-secondary">
                <Code2 size={17} />
                View Documentation
              </button>
            </div>

            <div className="iot-dashboard">
              <div className="iot-window-bar">
                <span className="iot-window-dot iot-red" />
                <span className="iot-window-dot iot-yellow" />
                <span className="iot-window-dot iot-green" />

                <span className="iot-window-name">
                  iot-manager / devices
                </span>
              </div>

              <div className="iot-dashboard-body">
                <aside className="iot-sidebar">
                  <div className="iot-side-label">
                    Workspace
                  </div>

                  <div className="iot-side-item active">
                    <Boxes size={14} />
                    Devices
                  </div>

                  <div className="iot-side-item">
                    <Activity size={14} />
                    Monitoring
                  </div>

                  <div className="iot-side-item">
                    <Terminal size={14} />
                    Terminal
                  </div>

                  <div className="iot-side-item">
                    <Radio size={14} />
                    WebSockets
                  </div>

                  <div className="iot-side-item">
                    <ShieldCheck size={14} />
                    Security
                  </div>
                </aside>

                <div className="iot-main-panel">
                  <div className="iot-panel-top">
                    <div className="iot-panel-title">
                      Connected Devices
                    </div>

                    <div className="iot-live">
                      <span />
                      LIVE
                    </div>
                  </div>

                  <div className="iot-devices">
                    <div className="iot-device-card">
                      <div className="iot-device-icon">
                        <Cpu size={17} />
                      </div>

                      <div className="iot-device-name">
                        ESP32_10061c
                      </div>

                      <div className="iot-device-meta">
                        WiFi • MicroPython
                      </div>

                      <div className="iot-device-status">
                        <span />
                        Connected
                      </div>
                    </div>

                    <div className="iot-device-card">
                      <div className="iot-device-icon">
                        <Wifi size={17} />
                      </div>

                      <div className="iot-device-name">
                        ESP32_CAMERA
                      </div>

                      <div className="iot-device-meta">
                        WiFi • Camera
                      </div>

                      <div className="iot-device-status">
                        <span />
                        Connected
                      </div>
                    </div>

                    <div className="iot-device-card">
                      <div className="iot-device-icon">
                        <Zap size={17} />
                      </div>

                      <div className="iot-device-name">
                        SENSOR_NODE
                      </div>

                      <div className="iot-device-meta">
                        MQTT • Sensors
                      </div>

                      <div className="iot-device-status">
                        <span />
                        Connected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="iot-features" id="features">
            <div className="iot-section-label">
              Built for IoT developers
            </div>

            <h2 className="iot-section-title">
              Everything your devices need.
            </h2>

            <div className="iot-feature-grid">
              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <Cpu size={20} />
                </div>

                <h3>Device Management</h3>

                <p>
                  Register and manage multiple ESP32 devices from
                  a single developer workspace with real-time status.
                </p>
              </div>

              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <Terminal size={20} />
                </div>

                <h3>Remote Terminal</h3>

                <p>
                  Execute MicroPython commands remotely and stream
                  output directly from your connected device.
                </p>
              </div>

              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <Activity size={20} />
                </div>

                <h3>Live Monitoring</h3>

                <p>
                  Monitor connections, device activity, telemetry
                  and WebSocket events in real time.
                </p>
              </div>

              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <Wifi size={20} />
                </div>

                <h3>Real-Time Communication</h3>

                <p>
                  Connect your hardware through persistent WebSocket
                  communication between devices and your backend.
                </p>
              </div>

              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <Code2 size={20} />
                </div>

                <h3>Developer Workspace</h3>

                <p>
                  Edit files, manage firmware and work with device
                  code through a developer-focused interface.
                </p>
              </div>

              <div className="iot-feature">
                <div className="iot-feature-icon">
                  <ShieldCheck size={20} />
                </div>

                <h3>Secure Device Access</h3>

                <p>
                  Keep device connections isolated so users can
                  access and control only their authorized devices.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="iot-footer">
          IOT.DEV — Intelligent infrastructure for connected devices.
        </footer>
      </div>
    </div>
  );
}