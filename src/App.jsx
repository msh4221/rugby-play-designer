import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Save, FolderOpen, RotateCcw } from 'lucide-react';

const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 900;
const PLAYER_RADIUS = 12;
const BALL_RADIUS = 6;
const BALL_SPEED_MULTIPLIER = 2.5;

const FORMATIONS = {
  scrum: {
    teamA: [
      { n: 1, x: 300, y: 700 }, { n: 2, x: 270, y: 700 }, { n: 3, x: 330, y: 700 },
      { n: 4, x: 280, y: 725 }, { n: 5, x: 320, y: 725 }, { n: 6, x: 260, y: 725 },
      { n: 7, x: 340, y: 725 }, { n: 8, x: 300, y: 750 }, { n: 9, x: 100, y: 790 },
      { n: 10, x: 180, y: 790 }, { n: 11, x: 260, y: 790 }, { n: 12, x: 340, y: 790 },
      { n: 13, x: 420, y: 790 }, { n: 14, x: 500, y: 790 }, { n: 15, x: 300, y: 850 }
    ],
    teamB: [
      { n: 1, x: 300, y: 200 }, { n: 2, x: 330, y: 200 }, { n: 3, x: 270, y: 200 },
      { n: 4, x: 320, y: 175 }, { n: 5, x: 280, y: 175 }, { n: 6, x: 340, y: 175 },
      { n: 7, x: 260, y: 175 }, { n: 8, x: 300, y: 150 }, { n: 9, x: 500, y: 110 },
      { n: 10, x: 420, y: 110 }, { n: 11, x: 340, y: 110 }, { n: 12, x: 260, y: 110 },
      { n: 13, x: 180, y: 110 }, { n: 14, x: 100, y: 110 }, { n: 15, x: 300, y: 50 }
    ]
  },
  lineout: {
    teamA: [
      { n: 1, x: 150, y: 690 }, { n: 2, x: 50, y: 700 }, { n: 3, x: 150, y: 710 },
      { n: 4, x: 100, y: 670 }, { n: 5, x: 100, y: 690 }, { n: 6, x: 100, y: 710 },
      { n: 7, x: 100, y: 730 }, { n: 8, x: 100, y: 750 }, { n: 9, x: 190, y: 700 },
      { n: 10, x: 250, y: 700 }, { n: 11, x: 310, y: 700 }, { n: 12, x: 370, y: 700 },
      { n: 13, x: 430, y: 700 }, { n: 14, x: 490, y: 700 }, { n: 15, x: 300, y: 800 }
    ],
    teamB: [
      { n: 1, x: 450, y: 710 }, { n: 2, x: 550, y: 700 }, { n: 3, x: 450, y: 690 },
      { n: 4, x: 500, y: 730 }, { n: 5, x: 500, y: 710 }, { n: 6, x: 500, y: 690 },
      { n: 7, x: 500, y: 670 }, { n: 8, x: 500, y: 650 }, { n: 9, x: 410, y: 700 },
      { n: 10, x: 350, y: 700 }, { n: 11, x: 290, y: 700 }, { n: 12, x: 230, y: 700 },
      { n: 13, x: 170, y: 700 }, { n: 14, x: 110, y: 700 }, { n: 15, x: 300, y: 100 }
    ]
  },
  freePlay: {
    teamA: [
      { n: 1, x: 280, y: 760 }, { n: 2, x: 320, y: 760 }, { n: 3, x: 300, y: 770 },
      { n: 4, x: 270, y: 740 }, { n: 5, x: 330, y: 740 }, { n: 6, x: 260, y: 750 },
      { n: 7, x: 340, y: 750 }, { n: 8, x: 300, y: 730 }, { n: 9, x: 280, y: 720 },
      { n: 10, x: 300, y: 680 }, { n: 11, x: 150, y: 700 }, { n: 12, x: 250, y: 690 },
      { n: 13, x: 350, y: 690 }, { n: 14, x: 450, y: 700 }, { n: 15, x: 300, y: 800 }
    ],
    teamB: [
      { n: 1, x: 320, y: 140 }, { n: 2, x: 280, y: 140 }, { n: 3, x: 300, y: 130 },
      { n: 4, x: 330, y: 160 }, { n: 5, x: 270, y: 160 }, { n: 6, x: 340, y: 150 },
      { n: 7, x: 260, y: 150 }, { n: 8, x: 300, y: 170 }, { n: 9, x: 320, y: 180 },
      { n: 10, x: 300, y: 220 }, { n: 11, x: 450, y: 200 }, { n: 12, x: 350, y: 210 },
      { n: 13, x: 250, y: 210 }, { n: 14, x: 150, y: 200 }, { n: 15, x: 300, y: 100 }
    ]
  }
};

function App() {
  const [formation, setFormation] = useState('scrum');
  const [players, setPlayers] = useState(() => initPlayers('scrum'));
  const [routes, setRoutes] = useState([]);
  const [ball, setBall] = useState({ x: 300, y: 750, startX: 300, startY: 750 });
  const [ballRoute, setBallRoute] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedBall, setSelectedBall] = useState(false);
  const [routeType, setRouteType] = useState(null);
  const [drawStart, setDrawStart] = useState(null);
  const [drawEnd, setDrawEnd] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playName, setPlayName] = useState('');
  const [ballMoved, setBallMoved] = useState(false);
  const [offsideLine, setOffsideLine] = useState(700);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const canvasRef = useRef(null);

  function initPlayers(formationType) {
    const f = FORMATIONS[formationType];
    return [
      ...f.teamA.map((p, i) => ({ id: i, team: 'A', number: p.n, x: p.x, y: p.y, startX: p.x, startY: p.y })),
      ...f.teamB.map((p, i) => ({ id: i + 15, team: 'B', number: p.n, x: p.x, y: p.y, startX: p.x, startY: p.y }))
    ];
  }

  useEffect(() => {
    const newPlayers = initPlayers(formation);
    setPlayers(newPlayers);
    setRoutes([]);
    setBallRoute(null);
    setSelectedPlayer(null);
    setSelectedBall(false);
    setFrame(0);
    setBallMoved(false);

    const teamAPlayers = newPlayers.filter(p => p.team === 'A');
    const avgY = teamAPlayers.reduce((sum, p) => sum + p.startY, 0) / teamAPlayers.length;
    const maxY = Math.max(...teamAPlayers.map(p => p.startY));
    setOffsideLine(maxY - 30);

    setBall({ x: 300, y: maxY - 10, startX: 300, startY: maxY - 10 });
  }, [formation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawField(ctx);
    drawOffsideLine(ctx);
    drawRoutes(ctx);
    if (ballRoute) drawBallRoute(ctx);
    drawPlayers(ctx);
    drawBall(ctx);
    if (drawStart && drawEnd && routeType) {
      drawPreviewRoute(ctx);
    }
  }, [players, routes, ball, ballRoute, selectedPlayer, selectedBall, drawStart, drawEnd, routeType, frame, offsideLine, ballMoved]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setFrame(f => {
          if (f >= 60) {
            setIsPlaying(false);
            return 60;
          }
          return f + 1;
        });
      }, (1000 / 60) / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    if (frame > 0 && isPlaying) {
      if (ballRoute) {
        const ballPos = getPositionAtFrame(ballRoute, Math.min(frame * BALL_SPEED_MULTIPLIER, 60), true);
        setBall(prev => ({ ...prev, x: ballPos.x, y: ballPos.y }));

        if (!ballMoved && frame > 2) {
          setBallMoved(true);
        }
      }

      setPlayers(prevPlayers => prevPlayers.map(p => {
        const route = routes.find(r => r.playerId === p.id);
        if (!route) return { ...p, x: p.startX, y: p.startY };
        const pos = getPositionAtFrame(route, frame, false);

        if (p.team === 'A' && !isPlaybackActive && pos.y < offsideLine) {
          return { ...p, x: pos.x, y: offsideLine, offsideViolation: true };
        }

        return { ...p, x: pos.x, y: pos.y, offsideViolation: false };
      }));
    } else if (frame === 0 && !isPlaying && !isDragging) {
      setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, x: p.startX, y: p.startY, offsideViolation: false })));
      setBall(prev => ({ ...prev, x: prev.startX, y: prev.startY }));
    }
  }, [frame, isPlaying, isDragging, routes, ballRoute, ballMoved, offsideLine]);

  function drawField(ctx) {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i <= FIELD_HEIGHT; i += FIELD_HEIGHT / 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(FIELD_WIDTH, i);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, FIELD_HEIGHT / 2);
    ctx.lineTo(FIELD_WIDTH, FIELD_HEIGHT / 2);
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawOffsideLine(ctx) {
    if (!ballMoved) {
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, offsideLine);
      ctx.lineTo(FIELD_WIDTH, offsideLine);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ff6b35';
      ctx.font = '12px sans-serif';
      ctx.fillText('Offsides Line', 10, offsideLine - 5);
    }
  }

  function drawPlayers(ctx) {
    players.forEach(p => {
      ctx.fillStyle = p.team === 'A' ? '#3b82f6' : '#ef4444';

      if (p.offsideViolation) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS + 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedPlayer === p.id) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.number, p.x, p.y);
    });
  }

  function drawBall(ctx) {
    ctx.fillStyle = '#8b4513';
    if (selectedBall) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBallRoute(ctx) {
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    drawSingleRoute(ctx, ballRoute);
    ctx.setLineDash([]);
  }

  function drawSingleRoute(ctx, route) {
    if (route.type === 'straight') {
      ctx.beginPath();
      ctx.moveTo(route.startX, route.startY);
      ctx.lineTo(route.endX, route.endY);
      ctx.stroke();
    } else if (route.type === 'post') {
      const midX = route.startX + (route.endX - route.startX) * 0.6;
      const midY = route.startY + (route.endY - route.startY) * 0.6;
      const angle = Math.atan2(route.endY - route.startY, route.endX - route.startX) + Math.PI / 4 * route.direction;
      const len = Math.hypot(route.endX - midX, route.endY - midY);
      const finalX = midX + Math.cos(angle) * len;
      const finalY = midY + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(route.startX, route.startY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
    } else if (route.type === 'arc') {
      ctx.beginPath();
      ctx.moveTo(route.startX, route.startY);
      ctx.quadraticCurveTo(route.controlX, route.controlY, route.endX, route.endY);
      ctx.stroke();
    }
  }

  function drawRoutes(ctx) {
    routes.forEach(route => {
      ctx.strokeStyle = route.team === 'A' ? '#60a5fa' : '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      drawSingleRoute(ctx, route);
      ctx.setLineDash([]);
    });
  }

  function drawPreviewRoute(ctx) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);

    if (routeType === 'straight') {
      ctx.beginPath();
      ctx.moveTo(drawStart.x, drawStart.y);
      ctx.lineTo(drawEnd.x, drawEnd.y);
      ctx.stroke();
    } else if (routeType === 'post') {
      const midX = drawStart.x + (drawEnd.x - drawStart.x) * 0.6;
      const midY = drawStart.y + (drawEnd.y - drawStart.y) * 0.6;
      const angle = Math.atan2(drawEnd.y - drawStart.y, drawEnd.x - drawStart.x) + Math.PI / 4;
      const len = Math.hypot(drawEnd.x - midX, drawEnd.y - midY);
      const finalX = midX + Math.cos(angle) * len;
      const finalY = midY + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(drawStart.x, drawStart.y);
      ctx.lineTo(midX, midY);
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
    } else if (routeType === 'arc') {
      const dx = drawEnd.x - drawStart.x;
      const dy = drawEnd.y - drawStart.y;
      const perpX = -dy;
      const perpY = dx;
      const len = Math.hypot(dx, dy);
      const offset = len * 0.3;
      const controlX = (drawStart.x + drawEnd.x) / 2 + (perpX / len) * offset;
      const controlY = (drawStart.y + drawEnd.y) / 2 + (perpY / len) * offset;

      ctx.beginPath();
      ctx.moveTo(drawStart.x, drawStart.y);
      ctx.quadraticCurveTo(controlX, controlY, drawEnd.x, drawEnd.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  function getPositionAtFrame(route, currentFrame, isBall = false) {
    const t = Math.min(currentFrame / 60, 1);

    if (route.type === 'straight') {
      return {
        x: route.startX + (route.endX - route.startX) * t,
        y: route.startY + (route.endY - route.startY) * t
      };
    } else if (route.type === 'post') {
      const midX = route.startX + (route.endX - route.startX) * 0.6;
      const midY = route.startY + (route.endY - route.startY) * 0.6;
      const angle = Math.atan2(route.endY - route.startY, route.endX - route.startX) + Math.PI / 4 * route.direction;
      const len = Math.hypot(route.endX - midX, route.endY - midY);
      const finalX = midX + Math.cos(angle) * len;
      const finalY = midY + Math.sin(angle) * len;

      if (t < 0.6) {
        const t1 = t / 0.6;
        return { x: route.startX + (midX - route.startX) * t1, y: route.startY + (midY - route.startY) * t1 };
      } else {
        const t2 = (t - 0.6) / 0.4;
        return { x: midX + (finalX - midX) * t2, y: midY + (finalY - midY) * t2 };
      }
    } else if (route.type === 'arc') {
      const x = Math.pow(1 - t, 2) * route.startX + 2 * (1 - t) * t * route.controlX + Math.pow(t, 2) * route.endX;
      const y = Math.pow(1 - t, 2) * route.startY + 2 * (1 - t) * t * route.controlY + Math.pow(t, 2) * route.endY;
      return { x, y };
    }

    return { x: route.startX, y: route.startY };
  }

  function handleCanvasMouseDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (routeType) {
      if (!drawStart) {
        setDrawStart({ x, y });
      }
      return;
    }

    const clickedBall = Math.hypot(ball.x - x, ball.y - y) < BALL_RADIUS + 5;
    if (clickedBall) {
      setSelectedBall(true);
      setSelectedPlayer(null);
      return;
    }

    const clicked = players.find(p =>
      Math.hypot(p.x - x, p.y - y) < PLAYER_RADIUS + 5
    );
    if (clicked) {
      setIsDragging(true);
      setDraggedPlayer(clicked.id);
      setSelectedPlayer(clicked.id);
      setSelectedBall(false);
    }
  }

  function handleCanvasMouseMove(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedPlayer !== null) {
      setPlayers(prevPlayers => prevPlayers.map(p =>
        p.id === draggedPlayer
          ? { ...p, x, y, startX: x, startY: y }
          : p
      ));
      return;
    }

    if (drawStart && routeType) {
      setDrawEnd({ x, y });
    }
  }

  function handleCanvasMouseUp(e) {
    if (isDragging) {
      setIsDragging(false);
      setDraggedPlayer(null);
      return;
    }

    if (routeType && drawStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (selectedBall) {
        const dx = x - drawStart.x;
        const dy = y - drawStart.y;
        const perpX = -dy;
        const perpY = dx;
        const len = Math.hypot(dx, dy);
        const offset = len * 0.3;
        const controlX = (drawStart.x + x) / 2 + (perpX / len) * offset;
        const controlY = (drawStart.y + y) / 2 + (perpY / len) * offset;

        const newRoute = {
          type: routeType,
          startX: ball.startX,
          startY: ball.startY,
          endX: x,
          endY: y,
          controlX: routeType === 'arc' ? controlX : undefined,
          controlY: routeType === 'arc' ? controlY : undefined,
          direction: 1
        };
        setBallRoute(newRoute);
      } else if (selectedPlayer !== null) {
        const player = players.find(p => p.id === selectedPlayer);
        const dx = x - drawStart.x;
        const dy = y - drawStart.y;
        const perpX = -dy;
        const perpY = dx;
        const len = Math.hypot(dx, dy);
        const offset = len * 0.3;
        const controlX = (drawStart.x + x) / 2 + (perpX / len) * offset;
        const controlY = (drawStart.y + y) / 2 + (perpY / len) * offset;

        const newRoute = {
          playerId: selectedPlayer,
          team: player.team,
          type: routeType,
          startX: player.startX,
          startY: player.startY,
          endX: x,
          endY: y,
          controlX: routeType === 'arc' ? controlX : undefined,
          controlY: routeType === 'arc' ? controlY : undefined,
          direction: 1
        };
        setRoutes([...routes.filter(r => r.playerId !== selectedPlayer), newRoute]);
      }

      setDrawStart(null);
      setDrawEnd(null);
      setRouteType(null);
      setSelectedPlayer(null);
      setSelectedBall(false);
    }
  }

  function resetPlay() {
    const newPlayers = initPlayers(formation);
    setPlayers(newPlayers);
    setRoutes([]);
    setBallRoute(null);

    const teamAPlayers = newPlayers.filter(p => p.team === 'A');
    const maxY = Math.max(...teamAPlayers.map(p => p.startY));
    const newBall = { x: 300, y: maxY - 10, startX: 300, startY: maxY - 10 };
    setBall(newBall);

    setFrame(0);
    setIsPlaying(false);
    setBallMoved(false);
    setIsPlaybackActive(false);
    setSelectedPlayer(null);
    setSelectedBall(false);
  }

  function savePlay() {
    if (!playName.trim()) {
      alert('Enter a play name');
      return;
    }
    const playData = {
      name: playName,
      routes,
      ballRoute,
      players: players.map(p => ({ ...p, startX: p.startX, startY: p.startY })),
      ball: { ...ball, x: ball.startX, y: ball.startY },
      formation,
      offsideLine,
      timestamp: Date.now()
    };
    window.storage = window.storage || { data: {} };
    window.storage.data[playName] = playData;
    alert('Play saved');
  }

  function loadPlay() {
    const name = prompt('Enter play name to load:');
    if (!name) return;

    window.storage = window.storage || { data: {} };
    const playData = window.storage.data[name];
    if (!playData) {
      alert('Play not found');
      return;
    }

    setPlayName(playData.name);
    setRoutes(playData.routes);
    setBallRoute(playData.ballRoute || null);
    setPlayers(playData.players);
    setBall(playData.ball || { x: 300, y: 750, startX: 300, startY: 750 });
    setFormation(playData.formation);
    setOffsideLine(playData.offsideLine || 750);
    setFrame(0);
    setBallMoved(false);
    setIsPlaying(false);
    alert('Play loaded');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Rugby Play Designer</h1>

        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="bg-gray-800 px-3 py-2 rounded"
          >
            <option value="scrum">Scrum</option>
            <option value="lineout">Lineout</option>
            <option value="freePlay">Free Play</option>
          </select>

          {(selectedPlayer !== null || selectedBall) && !routeType && (
            <div className="flex gap-2">
              <button onClick={() => setRouteType('straight')} className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700">Straight</button>
              <button onClick={() => setRouteType('post')} className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700">Post</button>
              <button onClick={() => setRouteType('arc')} className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700">Arc</button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const newIsPlaying = !isPlaying;
                setIsPlaying(newIsPlaying);
                if (newIsPlaying) setIsPlaybackActive(true);
                if (frame === 60) { resetPlay(); }
              }}
              className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => setFrame(Math.max(0, frame - 1))}
              disabled={isPlaying}
              className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={() => setFrame(Math.min(60, frame + 1))}
              disabled={isPlaying}
              className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={resetPlay}
              disabled={isPlaying}
              className="bg-orange-600 px-3 py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RotateCcw size={20} /> Reset
            </button>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-24"
            />
            <span>{speed}x</span>
          </div>

          <input
            type="text"
            placeholder="Play name"
            value={playName}
            onChange={(e) => setPlayName(e.target.value)}
            className="bg-gray-800 px-3 py-2 rounded"
          />
          <button onClick={savePlay} className="bg-purple-600 px-3 py-2 rounded hover:bg-purple-700 flex items-center gap-1">
            <Save size={20} /> Save
          </button>
          <button onClick={loadPlay} className="bg-purple-600 px-3 py-2 rounded hover:bg-purple-700 flex items-center gap-1">
            <FolderOpen size={20} /> Load
          </button>
        </div>

        <div className="mb-2 text-sm text-gray-400">
          <span className="font-semibold">Formation: </span>
          {formation === 'scrum' && 'Scrum (Set Piece)'}
          {formation === 'lineout' && 'Lineout (Sideline Throw)'}
          {formation === 'freePlay' && 'Free Play (Post-Ruck)'}
        </div>

        <canvas
          ref={canvasRef}
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="border-2 border-gray-700 rounded cursor-crosshair"
        />

        <div className="mt-4 text-sm text-gray-400">
          <p><strong>1. Reposition:</strong> Click and drag any player to move them to a new starting position</p>
          <p><strong>2. Draw Routes:</strong> Select a player/ball, choose route type (Straight/Post/Arc), then click and drag on field</p>
          <p><strong>3. Playback:</strong> Use play button to animate (ball moves 2.5x faster than players)</p>
          <p><strong>4. Offsides:</strong> Orange line enforced until ball moves - Team A cannot cross early (red highlight)</p>
          <p><strong>5. Reset:</strong> Returns all players to selected formation baseline (Scrum/Lineout/Free Play)</p>
        </div>
      </div>
    </div>
  );
}

export default App;
