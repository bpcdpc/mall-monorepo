// src/components/KakaoMap.jsx
import { useEffect, useRef, useState } from "react";

/* ───────────────────────── Kakao SDK 로더(로그/에러 상세) ───────────────────────── */
const loadKakao = (() => {
  let p; // singleton promise
  let ready = false;

  /**
   * @param {string} appKey - Kakao JS SDK 앱키 (JavaScript 키)
   * @param {string} libs   - "services,clusterer,drawing" 등
   * @param {{timeoutMs?:number, log?:boolean}} opts
   */
  return (appKey, libs = "services", opts = {}) => {
    const { timeoutMs = 15000, log = true } = opts;

    if (!appKey) {
      const msg = "[KAKAO] Missing app key (VITE_KAKAO_MAP_KEY)";
      log && console.error(msg);
      return Promise.reject(new Error(msg));
    }
    if (typeof window === "undefined") return Promise.resolve(); // SSR 안전
    if (window.kakao?.maps) {
      log && console.info("[KAKAO] SDK already ready");
      return Promise.resolve();
    }
    if (p) return p;

    p = new Promise((resolve, reject) => {
      const id = "kakao-maps-sdk";
      const wantSrc =
        `https://dapi.kakao.com/v2/maps/sdk.js` +
        `?appkey=${encodeURIComponent(appKey)}` +
        `&autoload=false` +
        `&libraries=${encodeURIComponent(libs)}`;

      const prev = document.getElementById(id);

      const finishOk = () => {
        try {
          window.kakao.maps.load(() => {
            ready = true;
            log && console.info("[KAKAO] SDK ready");
            resolve();
          });
        } catch (err) {
          log && console.error("[KAKAO] maps.load threw", err);
          cleanupOnFail(err);
        }
      };

      const makeDetail = (el, e, reason) => ({
        reason,
        type: e?.type,
        message:
          e?.message ||
          e?.error?.message ||
          (typeof e?.error === "string" ? e.error : undefined) ||
          undefined,
        src: el?.src,
        currentSrc: el?.currentSrc,
        readyState: el?.readyState,
      });

      const cleanupOnFail = (err, el) => {
        try {
          el && el.remove && el.remove();
        } catch (e) {
          console.error(`Error while cleanup : ${e.message}`);
        }
        p = undefined; // 다음 호출에서 재시도 가능
        reject(err instanceof Error ? err : new Error(String(err)));
      };

      const wire = (el, isNew) => {
        const to = setTimeout(() => {
          const detail = makeDetail(
            el,
            { type: "timeout", message: `Timeout ${timeoutMs}ms` },
            "timeout"
          );
          log && console.error("[KAKAO] SDK load timeout", detail);
          cleanupOnFail(
            new Error(
              `Kakao SDK load failed: ${detail.message || detail.reason}`
            ),
            el
          );
        }, timeoutMs);

        const onLoad = () => {
          clearTimeout(to);
          log && console.info("[KAKAO] Loaded script:", el.src);
          finishOk();
        };
        const onError = (e) => {
          clearTimeout(to);
          const detail = makeDetail(
            el,
            e,
            isNew ? "new-script-error" : "existing-script-error"
          );
          log && console.error("[KAKAO] SDK load failed", detail);
          cleanupOnFail(
            new Error(
              `Kakao SDK load failed: ${detail.message || detail.reason}`
            ),
            el
          );
        };

        el.addEventListener("load", onLoad, { once: true });
        el.addEventListener("error", onError, { once: true });

        if (isNew) {
          log && console.info("[KAKAO] Loading URL:", el.src);
          document.head.appendChild(el);
        } else {
          log && console.info("[KAKAO] Reusing existing script:", el.src);
        }
      };

      // 1) 스크립트가 없거나 src가 다르면 새로 추가
      if (!prev || prev.src !== wantSrc) {
        if (prev) {
          log &&
            console.warn("[KAKAO] Removing different script tag:", prev.src);
          try {
            prev.remove();
          } catch (e) {
            console.error(
              `Failed to remove pre-existing script : ${e.message}`
            );
          }
        }
        const s = document.createElement("script");
        s.id = id;
        s.async = true;
        s.src = wantSrc;
        wire(s, true);
        return;
      }

      // 2) 기존 태그 재사용
      if (ready) {
        log && console.info("[KAKAO] SDK was ready (existing tag)");
        resolve();
      } else {
        wire(prev, false);
      }
    });

    return p;
  };
})();

/* ─────────────────────────────── KakaoMap ─────────────────────────────── */
export default function KakaoMap({
  markers = [],
  activeId = null,
  focusLevel,
  animate = true,
  level = 7,
  height = 420,
  markerIconUrl,
  markerIconSize = { w: 24, h: 28 },
  markerIconAnchor,
  showMapType = true,
  showZoom = true,
  infoMaxWidth = 420,
  onMarkerClick,
}) {
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const controlsRef = useRef({ mapType: null, zoom: null });
  const markerMapRef = useRef(new Map()); // key: String(id) -> { marker, pos, data }
  const infoRef = useRef(null); // 재사용 InfoWindow
  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  const [errorMsg, setErrorMsg] = useState(null);

  const esc = (v = "") =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const infoHtml = (s) => `
    <div style="
      width:fit-content; max-width:${infoMaxWidth}px;
      padding:10px 12px; font-size:12px; line-height:1.45; word-break:keep-all;
    ">
      <div style="font-weight:600; color:#0063ba; margin-bottom:4px;">${esc(
        s.title || ""
      )}</div>
      ${
        s.address
          ? `<div style="white-space:nowrap;">${esc(s.address)}</div>`
          : ""
      }
      ${s.phone ? `<div style="color:#666;">☎ ${esc(s.phone)}</div>` : ""}
    </div>
  `;

  function openInfo(entry, { animate: doAnimate = true, focusLevel: fl } = {}) {
    const map = mapRef.current;
    const info = infoRef.current;
    if (!map || !info || !entry) return;

    const { marker, pos, data } = entry;
    info.setContent(infoHtml(data)); // 내용 업데이트
    if (typeof fl === "number") map.setLevel(fl);

    if (doAnimate && map.panTo) {
      const cur = map.getCenter?.();
      const same =
        cur &&
        Math.abs(cur.getLat() - pos.getLat()) < 1e-9 &&
        Math.abs(cur.getLng() - pos.getLng()) < 1e-9;

      if (same) {
        info.open(map, marker); // 같은 위치면 바로 재앵커
        return;
      }

      let done = false;
      const handler = () => {
        if (done) return;
        done = true;
        window.kakao.maps.event.removeListener(map, "idle", handler);
        info.open(map, marker);
      };
      window.kakao.maps.event.addListener(map, "idle", handler);

      setTimeout(() => {
        if (done) return;
        done = true;
        window.kakao.maps.event.removeListener(map, "idle", handler);
        info.open(map, marker);
      }, 700);

      map.panTo(pos);
    } else {
      map.setCenter(pos);
      info.open(map, marker);
    }
  }

  // 최초 로드 및 마커 렌더
  useEffect(() => {
    let cleanupResize;

    (async () => {
      // 0) env 키 없으면 UI로 안내하고 종료
      if (!appKey) {
        const msg =
          "카카오 지도 API 키(VITE_KAKAO_MAP_KEY)가 설정되지 않았습니다.";
        setErrorMsg(msg);
        console.error("[KAKAO]", msg);
        return;
      }

      // 1) SDK 로드 (URL/에러 콘솔 출력)
      try {
        await loadKakao(appKey, "services", { log: true, timeoutMs: 15000 });
        setErrorMsg(null);
      } catch (err) {
        const detail = err?.message || String(err);
        setErrorMsg(detail);
        return; // 로딩 실패 시 후속 로직 중단
      }

      // 2) 지도 생성/갱신
      if (!mapRef.current) {
        if (!wrapRef.current) return;

        mapRef.current = new window.kakao.maps.Map(wrapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level,
        });

        const onResize = () => mapRef.current?.relayout();
        window.addEventListener("resize", onResize);
        cleanupResize = () => window.removeEventListener("resize", onResize);

        infoRef.current = new window.kakao.maps.InfoWindow({
          content: "<div/>",
          removable: true,
        });
      } else {
        mapRef.current.setLevel(level);
      }
      const map = mapRef.current;

      // 3) 컨트롤 재설치
      const removeCtl = (ctl) => ctl && map.removeControl(ctl);
      removeCtl(controlsRef.current.mapType);
      removeCtl(controlsRef.current.zoom);

      if (showMapType) {
        const ctl = new window.kakao.maps.MapTypeControl();
        map.addControl(ctl, window.kakao.maps.ControlPosition.TOPRIGHT);
        controlsRef.current.mapType = ctl;
      } else controlsRef.current.mapType = null;

      if (showZoom) {
        const ctl = new window.kakao.maps.ZoomControl();
        map.addControl(ctl, window.kakao.maps.ControlPosition.RIGHT);
        controlsRef.current.zoom = ctl;
      } else controlsRef.current.zoom = null;

      // 4) 기존 마커 제거
      markerMapRef.current.forEach(({ marker }) => marker?.setMap(null));
      markerMapRef.current.clear();

      // 5) 공통 아이콘
      let markerImage = null;
      if (markerIconUrl) {
        const w = markerIconSize?.w ?? 24;
        const h = markerIconSize?.h ?? 28;
        const size = new window.kakao.maps.Size(w, h);
        const offset = new window.kakao.maps.Point(
          markerIconAnchor?.x ?? Math.floor(w / 2),
          markerIconAnchor?.y ?? h
        );
        markerImage = new window.kakao.maps.MarkerImage(markerIconUrl, size, {
          offset,
        });
      }

      // 6) 마커 생성
      const allPositions = [];
      markers.forEach((s) => {
        const lat = Number(s.lat),
          lng = Number(s.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const pos = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({
          position: pos,
          map,
          image: markerImage || undefined,
          title: s.title,
        });

        const entry = { marker, pos, data: s };
        markerMapRef.current.set(String(s.id), entry);
        allPositions.push(pos);

        window.kakao.maps.event.addListener(marker, "click", () => {
          onMarkerClick?.(s.id);
          openInfo(entry, { animate: true, focusLevel });
        });
      });

      // 7) 초기 뷰
      if (allPositions.length && !activeId) {
        const bounds = new window.kakao.maps.LatLngBounds();
        allPositions.forEach((p) => bounds.extend(p));
        map.setBounds(bounds);
      }

      // 8) activeId가 있으면 즉시 오픈
      if (activeId) {
        const entry = markerMapRef.current.get(String(activeId));
        entry && openInfo(entry, { animate, focusLevel });
      }
    })();

    return () => cleanupResize && cleanupResize();
  }, [
    markers,
    markerIconUrl,
    markerIconSize?.w,
    markerIconSize?.h,
    markerIconAnchor?.x,
    markerIconAnchor?.y,
    level,
    showMapType,
    showZoom,
    infoMaxWidth,
    appKey,
    onMarkerClick,
    activeId,
    animate,
    focusLevel,
  ]);

  // activeId가 변경될 때마다 이동+오픈
  useEffect(() => {
    if (activeId == null) return;
    const entry = markerMapRef.current.get(String(activeId));
    entry && openInfo(entry, { animate, focusLevel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  /* ─────────────── UI: 에러 또는 키 없음일 때 메시지 출력 ─────────────── */
  if (!appKey || errorMsg) {
    return (
      <div
        style={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 16,
          border: "1px dashed #e5e7eb",
          color: "#6b7280",
          background: "#f9fafb",
          borderRadius: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {!appKey
              ? "카카오 지도 API 키가 필요합니다."
              : "지도를 불러오지 못했습니다."}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            {!appKey
              ? "환경변수 VITE_KAKAO_MAP_KEY를 설정하고 개발 서버를 재시작하세요."
              : errorMsg}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── 정상 지도 렌더 ─────────────── */
  return <div ref={wrapRef} style={{ width: "100%", height }} />;
}
