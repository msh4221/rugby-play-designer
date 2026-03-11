import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Save, FolderOpen, RotateCcw, LogOut, LogIn } from 'lucide-react';
import { supabase } from './supabaseClient';

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const PLAYER_RADIUS = 12;
const BALL_RADIUS = 6;
const BALL_SPEED_MULTIPLIER = 2.5;
const OFFSIDE_TAB_WIDTH = 15;
const OFFSIDE_TAB_HEIGHT = 40;
const OFFSIDE_MARGIN = 100; // 10 "meters" from top/bottom

const FORMATIONS = {
  scrum: {
    teamA: [
      { n: 1, x: 400, y: 410 }, { n: 2, x: 360, y: 410 }, { n: 3, x: 440, y: 410 },
      { n: 4, x: 370, y: 430 }, { n: 5, x: 430, y: 430 }, { n: 6, x: 345, y: 430 },
      { n: 7, x: 455, y: 430 }, { n: 8, x: 400, y: 450 }, { n: 9, x: 130, y: 480 },
      { n: 10, x: 240, y: 480 }, { n: 11, x: 345, y: 480 }, { n: 12, x: 455, y: 480 },
      { n: 13, x: 560, y: 480 }, { n: 14, x: 670, y: 480 }, { n: 15, x: 400, y: 540 }
    ],
    teamB: [
      { n: 1, x: 400, y: 390 }, { n: 2, x: 440, y: 390 }, { n: 3, x: 360, y: 390 },
      { n: 4, x: 430, y: 370 }, { n: 5, x: 370, y: 370 }, { n: 6, x: 455, y: 370 },
      { n: 7, x: 345, y: 370 }, { n: 8, x: 400, y: 350 }, { n: 9, x: 670, y: 320 },
      { n: 10, x: 560, y: 320 }, { n: 11, x: 455, y: 320 }, { n: 12, x: 345, y: 320 },
      { n: 13, x: 240, y: 320 }, { n: 14, x: 130, y: 320 }, { n: 15, x: 400, y: 260 }
    ]
  },
  lineoutLeft: {
    teamA: [
      { n: 1, x: 20, y: 235 }, { n: 2, x: 5, y: 210 }, { n: 3, x: 180, y: 235 },
      { n: 4, x: 40, y: 220 }, { n: 5, x: 70, y: 220 }, { n: 6, x: 100, y: 220 },
      { n: 7, x: 130, y: 220 }, { n: 8, x: 160, y: 220 }, { n: 9, x: 195, y: 220 },
      { n: 10, x: 290, y: 265 }, { n: 11, x: 100, y: 285 }, { n: 12, x: 390, y: 265 },
      { n: 13, x: 490, y: 265 }, { n: 14, x: 660, y: 260 }, { n: 15, x: 400, y: 370 }
    ],
    teamB: [
      { n: 1, x: 20, y: 190 }, { n: 2, x: 185, y: 200 }, { n: 3, x: 185, y: 190 },
      { n: 4, x: 40, y: 200 }, { n: 5, x: 70, y: 200 }, { n: 6, x: 100, y: 200 },
      { n: 7, x: 130, y: 200 }, { n: 8, x: 160, y: 200 }, { n: 9, x: 200, y: 198 },
      { n: 10, x: 290, y: 155 }, { n: 11, x: 100, y: 130 }, { n: 12, x: 390, y: 155 },
      { n: 13, x: 490, y: 155 }, { n: 14, x: 660, y: 150 }, { n: 15, x: 400, y: 80 }
    ]
  },
  lineoutRight: {
    teamA: [
      { n: 1, x: 780, y: 235 }, { n: 2, x: 795, y: 210 }, { n: 3, x: 620, y: 235 },
      { n: 4, x: 760, y: 220 }, { n: 5, x: 730, y: 220 }, { n: 6, x: 700, y: 220 },
      { n: 7, x: 670, y: 220 }, { n: 8, x: 640, y: 220 }, { n: 9, x: 605, y: 220 },
      { n: 10, x: 510, y: 265 }, { n: 11, x: 140, y: 260 }, { n: 12, x: 410, y: 265 },
      { n: 13, x: 310, y: 265 }, { n: 14, x: 700, y: 285 }, { n: 15, x: 400, y: 370 }
    ],
    teamB: [
      { n: 1, x: 780, y: 190 }, { n: 2, x: 615, y: 200 }, { n: 3, x: 615, y: 190 },
      { n: 4, x: 760, y: 200 }, { n: 5, x: 730, y: 200 }, { n: 6, x: 700, y: 200 },
      { n: 7, x: 670, y: 200 }, { n: 8, x: 640, y: 200 }, { n: 9, x: 600, y: 198 },
      { n: 10, x: 510, y: 155 }, { n: 11, x: 660, y: 130 }, { n: 12, x: 410, y: 155 },
      { n: 13, x: 310, y: 155 }, { n: 14, x: 140, y: 150 }, { n: 15, x: 400, y: 80 }
    ]
  },
  freePlay: {
    teamA: [
      // At ruck: #6, #7 (forwards), #11 (blindside back), #9 behind
      { n: 6, x: 100, y: 335 }, { n: 7, x: 122, y: 335 }, { n: 11, x: 65, y: 348 },
      { n: 9, x: 112, y: 362 },
      // Pod in front of #10 (#4, #5, #8)
      { n: 4, x: 228, y: 372 }, { n: 5, x: 268, y: 368 }, { n: 8, x: 308, y: 372 },
      // #10: 5m back from #9, stepping right
      { n: 10, x: 267, y: 392 },
      // Pod in front of #12 (#1, #3)
      { n: 1, x: 400, y: 406 }, { n: 3, x: 440, y: 406 },
      // #12: same step-right/back ratio as #9→#10
      { n: 12, x: 422, y: 422 },
      // #13, #14: spread evenly to right sideline behind #12
      { n: 13, x: 545, y: 432 }, { n: 14, x: 668, y: 432 },
      // #2: left sideline forward
      { n: 2, x: 15, y: 370 },
      // #15: wide right as extra back
      { n: 15, x: 765, y: 448 }
    ],
    teamB: [
      // Very close either side of ruck (ruck center ~x=110)
      { n: 6, x: 90, y: 300 }, { n: 7, x: 132, y: 300 },
      // Directly outside those
      { n: 4, x: 55, y: 300 }, { n: 5, x: 168, y: 300 },
      // Normal flat line filling the rest of the field
      { n: 1, x: 210, y: 300 }, { n: 2, x: 284, y: 300 }, { n: 3, x: 358, y: 300 },
      { n: 8, x: 432, y: 300 }, { n: 9, x: 506, y: 300 }, { n: 10, x: 580, y: 300 },
      { n: 12, x: 654, y: 300 }, { n: 13, x: 728, y: 300 },
      // Wings on sidelines, slightly off the line (deeper)
      { n: 11, x: 20, y: 312 }, { n: 14, x: 778, y: 312 },
      // Fullback sweeper
      { n: 15, x: 400, y: 248 }
    ]
  },
  sevens: {
    teamA: [
      // Left pod (3 players): #1, #2, #3
      { n: 1, x: 200, y: 340 }, { n: 2, x: 160, y: 360 }, { n: 3, x: 240, y: 360 },
      // Center player: #9 (scrum-half)
      { n: 9, x: 400, y: 380 },
      // Right pod (3 players): #4, #5, #6
      { n: 4, x: 600, y: 340 }, { n: 5, x: 560, y: 360 }, { n: 6, x: 640, y: 360 }
    ],
    teamB: [
      // Defensive line (6 players) spread across field
      { n: 1, x: 150, y: 300 }, { n: 2, x: 270, y: 300 }, { n: 3, x: 390, y: 300 },
      { n: 4, x: 510, y: 300 }, { n: 5, x: 630, y: 300 }, { n: 6, x: 750, y: 300 },
      // Sweeper/Fullback (7th player)
      { n: 15, x: 400, y: 220 }
    ]
  }
};

function App() {
  // Auth states
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Existing game states
  const [formation, setFormation] = useState('scrum');
  const [players, setPlayers] = useState(() => initPlayers('scrum'));
  const [routes, setRoutes] = useState([]);
  const [ball, setBall] = useState({ x: 300, y: 750, startX: 300, startY: 750 });
  const [ballSequence, setBallSequence] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedBall, setSelectedBall] = useState(false);
  const [routeType, setRouteType] = useState(null);
  const [isBallPassingMode, setIsBallPassingMode] = useState(false);
  const [ballSequenceBuilder, setBallSequenceBuilder] = useState([]);
  const [lastBallPosition, setLastBallPosition] = useState(null);
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
  const [maxFrames, setMaxFrames] = useState(60);
  const [isDraggingOffsideTab, setIsDraggingOffsideTab] = useState(false);

  // Lasso selection states
  const [lassoStart, setLassoStart] = useState(null);
  const [lassoEnd, setLassoEnd] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isLassoing, setIsLassoing] = useState(false);
  const [isGroupDragging, setIsGroupDragging] = useState(false);
  const [groupDragStart, setGroupDragStart] = useState(null);

  // Double-click popup menu states
  const [popupMenu, setPopupMenu] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedPlayer, setLastClickedPlayer] = useState(null);
  const [showPostAngleMenu, setShowPostAngleMenu] = useState(false);
  const [postAngle, setPostAngle] = useState(1); // 1 = right, -1 = left
  const DOUBLE_CLICK_THRESHOLD = 250;

  const canvasRef = useRef(null);

  // Check auth status on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Auth functions
  async function handleSignUp() {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;
      alert('Check your email for a confirmation link');
      setAuthEmail('');
      setAuthPassword('');
      setIsSignUp(false);
    } catch (error) {
      alert('Error signing up: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignIn() {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      alert('Error signing in: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      alert('Error signing out: ' + error.message);
    }
  }

  const finalizeBallSequence = React.useCallback(() => {
    if (ballSequenceBuilder.length === 0) {
      setIsBallPassingMode(false);
      setSelectedBall(false);
      setLastBallPosition(null);
      return;
    }

    let cumulativeFrame = 0;
    const finalizedSequence = ballSequenceBuilder.map((segment, index) => {
      const startFrame = cumulativeFrame;
      const endFrame = startFrame + segment.duration;
      cumulativeFrame = endFrame;

      return {
        ...segment,
        segmentIndex: index,
        startFrame,
        endFrame
      };
    });

    setBallSequence(finalizedSequence);
    setBallSequenceBuilder([]);
    setIsBallPassingMode(false);
    setSelectedBall(false);
    setLastBallPosition(null);

    // Update ball's start position to first player in sequence
    const firstSegment = finalizedSequence[0];
    setBall(prev => ({
      ...prev,
      startX: firstSegment.startX,
      startY: firstSegment.startY
    }));
  }, [ballSequenceBuilder]);

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
    setBallSequence([]);
    setSelectedPlayer(null);
    setSelectedBall(false);
    setSelectedPlayers([]);
    setFrame(0);
    setBallMoved(false);
    setIsBallPassingMode(false);
    setBallSequenceBuilder([]);
    setLastBallPosition(null);

    const teamAPlayers = newPlayers.filter(p => p.team === 'A');
    const teamBPlayers = newPlayers.filter(p => p.team === 'B');
    const teamAMinY = Math.min(...teamAPlayers.map(p => p.startY));
    const teamBMaxY = Math.max(...teamBPlayers.map(p => p.startY));
    const centerLine = (teamAMinY + teamBMaxY) / 2;
    setOffsideLine(centerLine);

    setBall({ x: FIELD_WIDTH / 2, y: teamAMinY - 10, startX: FIELD_WIDTH / 2, startY: teamAMinY - 10 });
  }, [formation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawField(ctx);
    drawOffsideLine(ctx);
    drawOffsideTab(ctx);
    drawRoutes(ctx);
    if (ballSequence.length > 0) drawBallSequence(ctx);
    drawBallSequenceBuilder(ctx);
    drawPlayers(ctx);
    drawBall(ctx);
    drawLassoBox(ctx);
    if (drawStart && drawEnd && routeType) {
      drawPreviewRoute(ctx);
    }
  }, [players, routes, ball, ballSequence, ballSequenceBuilder, isBallPassingMode, lastBallPosition, selectedPlayer, selectedBall, drawStart, drawEnd, routeType, frame, offsideLine, ballMoved, lassoStart, lassoEnd, selectedPlayers, isLassoing, isDraggingOffsideTab, postAngle, showPostAngleMenu]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setFrame(f => {
          if (f >= maxFrames) {
            setIsPlaying(false);
            return maxFrames;
          }
          return f + 1;
        });
      }, (1000 / 60) / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, maxFrames]);

  useEffect(() => {
    function handleKeyPress(e) {
      if (e.key === 'Escape' && isBallPassingMode) {
        finalizeBallSequence();
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isBallPassingMode, finalizeBallSequence]);

  useEffect(() => {
    let max = 60;

    routes.forEach(route => {
      if (route.duration && route.duration > max) {
        max = route.duration;
      }
    });

    if (ballSequence.length > 0) {
      const lastSegment = ballSequence[ballSequence.length - 1];
      const ballFrames = Math.ceil(lastSegment.endFrame / BALL_SPEED_MULTIPLIER);
      if (ballFrames > max) max = ballFrames;
    }

    setMaxFrames(max);
  }, [routes, ballSequence]);

  useEffect(() => {
    if (frame > 0 && isPlaying) {
      if (ballSequence.length > 0) {
        const ballFrame = Math.min(frame * BALL_SPEED_MULTIPLIER,
                                   ballSequence[ballSequence.length - 1].endFrame);

        const activeSegment = ballSequence.find(seg =>
          ballFrame >= seg.startFrame && ballFrame < seg.endFrame
        );

        if (activeSegment) {
          const segmentFrame = ballFrame - activeSegment.startFrame;
          const ballPos = getPositionAtFrame(activeSegment, segmentFrame, true);
          setBall(prev => ({ ...prev, x: ballPos.x, y: ballPos.y }));
        } else if (ballFrame >= ballSequence[ballSequence.length - 1].endFrame) {
          const lastSeg = ballSequence[ballSequence.length - 1];
          setBall(prev => ({ ...prev, x: lastSeg.endX, y: lastSeg.endY }));
        }

        if (!ballMoved && frame > 2) {
          setBallMoved(true);
        }
      }

      setPlayers(prevPlayers => prevPlayers.map(p => {
        const route = routes.find(r => r.playerId === p.id);
        if (!route) return { ...p, x: p.startX, y: p.startY };

        if (frame >= route.duration) {
          const finalPos = getPositionAtFrame(route, route.duration, false);
          return { ...p, x: finalPos.x, y: finalPos.y, offsideViolation: false };
        }

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
  }, [frame, isPlaying, isDragging, routes, ballSequence, ballMoved, offsideLine]);

  function drawField(ctx) {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i <= FIELD_HEIGHT; i += FIELD_HEIGHT / 6) {
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

  function drawOffsideTab(ctx) {
    if (ballMoved) return;

    const tabX = 0; // Left edge of canvas
    const tabY = offsideLine - OFFSIDE_TAB_HEIGHT / 2;

    // Draw tab background
    ctx.fillStyle = isDraggingOffsideTab ? '#ff8c61' : '#ff6b35';
    ctx.fillRect(tabX, tabY, OFFSIDE_TAB_WIDTH, OFFSIDE_TAB_HEIGHT);

    // Draw tab border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(tabX, tabY, OFFSIDE_TAB_WIDTH, OFFSIDE_TAB_HEIGHT);

    // Draw grip lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = tabY + OFFSIDE_TAB_HEIGHT / 2 - 6 + i * 6;
      ctx.beginPath();
      ctx.moveTo(tabX + 3, y);
      ctx.lineTo(tabX + OFFSIDE_TAB_WIDTH - 3, y);
      ctx.stroke();
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
      } else if (selectedPlayers.includes(p.id)) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PLAYER_RADIUS + 4, 0, Math.PI * 2);
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

  function drawBallSequence(ctx) {
    if (ballSequence.length === 0) return;

    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    ballSequence.forEach(segment => {
      ctx.beginPath();
      ctx.moveTo(segment.startX, segment.startY);
      ctx.lineTo(segment.endX, segment.endY);
      ctx.stroke();

      ctx.fillStyle = '#d4a574';
      ctx.beginPath();
      ctx.arc(segment.endX, segment.endY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.setLineDash([]);
  }

  function drawBallSequenceBuilder(ctx) {
    if (!isBallPassingMode || ballSequenceBuilder.length === 0) return;

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    ballSequenceBuilder.forEach((segment, index) => {
      ctx.strokeStyle = index === ballSequenceBuilder.length - 1 ? '#fbbf24' : '#d4a574';
      ctx.beginPath();
      ctx.moveTo(segment.startX, segment.startY);
      ctx.lineTo(segment.endX, segment.endY);
      ctx.stroke();
    });

    ctx.setLineDash([]);

    if (lastBallPosition) {
      ctx.fillStyle = '#8b4513';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lastBallPosition.x, lastBallPosition.y, BALL_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lastBallPosition.x, lastBallPosition.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
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
      const angle = Math.atan2(drawEnd.y - drawStart.y, drawEnd.x - drawStart.x) + Math.PI / 4 * postAngle;
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

  function drawLassoBox(ctx) {
    if (isLassoing && lassoStart && lassoEnd) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const width = lassoEnd.x - lassoStart.x;
      const height = lassoEnd.y - lassoStart.y;

      ctx.strokeRect(lassoStart.x, lassoStart.y, width, height);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
      ctx.fillRect(lassoStart.x, lassoStart.y, width, height);

      ctx.setLineDash([]);
    }
  }

  function getPositionAtFrame(route, currentFrame, isBall = false) {
    const maxFrame = route.duration || 60;
    const t = Math.min(currentFrame / maxFrame, 1);

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

  function getScaledCoordinates(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = FIELD_WIDTH / rect.width;
    const scaleY = FIELD_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  }

  function calculateRouteLength(route) {
    if (route.type === 'straight') {
      return Math.hypot(route.endX - route.startX, route.endY - route.startY);
    }

    if (route.type === 'post') {
      const midX = route.startX + (route.endX - route.startX) * 0.6;
      const midY = route.startY + (route.endY - route.startY) * 0.6;
      const angle = Math.atan2(route.endY - route.startY, route.endX - route.startX)
                    + Math.PI / 4 * route.direction;
      const len = Math.hypot(route.endX - midX, route.endY - midY);
      const finalX = midX + Math.cos(angle) * len;
      const finalY = midY + Math.sin(angle) * len;

      return Math.hypot(midX - route.startX, midY - route.startY) +
             Math.hypot(finalX - midX, finalY - midY);
    }

    if (route.type === 'arc') {
      let totalLength = 0;
      let prevX = route.startX;
      let prevY = route.startY;

      for (let i = 1; i <= 10; i++) {
        const t = i / 10;
        const x = Math.pow(1-t, 2) * route.startX +
                  2 * (1-t) * t * route.controlX +
                  Math.pow(t, 2) * route.endX;
        const y = Math.pow(1-t, 2) * route.startY +
                  2 * (1-t) * t * route.controlY +
                  Math.pow(t, 2) * route.endY;

        totalLength += Math.hypot(x - prevX, y - prevY);
        prevX = x;
        prevY = y;
      }
      return totalLength;
    }

    return 0;
  }

  const BASE_SPEED = 3.5;

  function calculateRouteDuration(routeLength) {
    const frames = Math.round(routeLength / BASE_SPEED);
    return Math.max(30, Math.min(180, frames));
  }

  function handleCanvasMouseDown(e) {
    const { x, y } = getScaledCoordinates(e);

    // Priority 0: Offsides tab dragging
    if (!ballMoved) {
      const tabX = 0;
      const tabY = offsideLine - OFFSIDE_TAB_HEIGHT / 2;
      if (x >= tabX && x <= tabX + OFFSIDE_TAB_WIDTH &&
          y >= tabY && y <= tabY + OFFSIDE_TAB_HEIGHT) {
        setIsDraggingOffsideTab(true);
        return;
      }
    }

    // Priority 1: Route drawing mode active
    if (routeType) {
      if (!drawStart) {
        setDrawStart({ x, y });
      }
      return;
    }

    // Priority 2: Ball selection
    const clickedBall = Math.hypot(ball.x - x, ball.y - y) < BALL_RADIUS + 5;
    if (clickedBall) {
      if (!isBallPassingMode) {
        setIsBallPassingMode(true);
        setSelectedBall(true);
        setSelectedPlayer(null);
        setSelectedPlayers([]);
        setLastBallPosition(null);
        setBallSequenceBuilder([]);
      } else {
        finalizeBallSequence();
      }
      return;
    }

    // Priority 3: Player click
    const clicked = players.find(p =>
      Math.hypot(p.x - x, p.y - y) < PLAYER_RADIUS + 5
    );

    if (clicked) {
      // Ball passing mode: add pass to player
      if (isBallPassingMode) {
        // First player click: just set the starting point
        if (lastBallPosition === null) {
          setLastBallPosition({ x: clicked.x, y: clicked.y });
          return;
        }

        // Subsequent clicks: create pass segments
        const newSegment = {
          type: 'straight',
          startX: lastBallPosition.x,
          startY: lastBallPosition.y,
          endX: clicked.x,
          endY: clicked.y,
          targetPlayerId: clicked.id
        };

        const length = calculateRouteLength(newSegment);
        const duration = calculateRouteDuration(length);
        newSegment.length = length;
        newSegment.duration = duration;

        setBallSequenceBuilder([...ballSequenceBuilder, newSegment]);
        setLastBallPosition({ x: clicked.x, y: clicked.y });
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastClickTime;

      // Check for double-click
      if (lastClickedPlayer === clicked.id && timeDiff < DOUBLE_CLICK_THRESHOLD) {
        // DOUBLE-CLICK - show popup menu
        setPopupMenu({
          playerId: clicked.id,
          x: clicked.x,
          y: clicked.y
        });
        setSelectedPlayer(clicked.id);
        setSelectedBall(false);
        setSelectedPlayers([]);
        setLastClickedPlayer(null);
        setLastClickTime(0);
        return;
      }

      // FIRST CLICK - record time
      setLastClickTime(now);
      setLastClickedPlayer(clicked.id);

      // Case A: Clicked on a player in the selected group - start group drag
      if (selectedPlayers.includes(clicked.id)) {
        setIsGroupDragging(true);
        setGroupDragStart({ x, y });
        return;
      }

      // Case B: Single player drag - clear group selection
      setIsDragging(true);
      setDraggedPlayer(clicked.id);
      setSelectedPlayer(clicked.id);
      setSelectedBall(false);
      setSelectedPlayers([]);
      return;
    }

    // Priority 4: Empty space - start lasso
    setIsLassoing(true);
    setLassoStart({ x, y });
    setLassoEnd({ x, y });
    setSelectedPlayer(null);
    setSelectedBall(false);
    setSelectedPlayers([]);
  }

  function handleCanvasMouseMove(e) {
    const { x, y } = getScaledCoordinates(e);

    // Case 0: Offsides tab dragging
    if (isDraggingOffsideTab) {
      const newOffsideLine = Math.max(OFFSIDE_MARGIN, Math.min(FIELD_HEIGHT - OFFSIDE_MARGIN, y));
      setOffsideLine(newOffsideLine);

      // Snap players to stay on their side of the offsides line
      setPlayers(prevPlayers => prevPlayers.map(p => {
        // Team A (blue) must stay at or below the line (higher Y values)
        if (p.team === 'A' && p.startY < newOffsideLine) {
          return { ...p, y: newOffsideLine, startY: newOffsideLine };
        }
        // Team B (red) must stay at or above the line (lower Y values)
        if (p.team === 'B' && p.startY > newOffsideLine) {
          return { ...p, y: newOffsideLine, startY: newOffsideLine };
        }
        return p;
      }));
      return;
    }

    // Case 1: Single player dragging
    if (isDragging && draggedPlayer !== null) {
      setPlayers(prevPlayers => prevPlayers.map(p =>
        p.id === draggedPlayer
          ? { ...p, x, y, startX: x, startY: y }
          : p
      ));
      return;
    }

    // Case 2: Group dragging
    if (isGroupDragging && groupDragStart) {
      const deltaX = x - groupDragStart.x;
      const deltaY = y - groupDragStart.y;

      setPlayers(prevPlayers => prevPlayers.map(p => {
        if (selectedPlayers.includes(p.id)) {
          return {
            ...p,
            x: p.startX + deltaX,
            y: p.startY + deltaY
          };
        }
        return p;
      }));
      return;
    }

    // Case 3: Lasso box drawing
    if (isLassoing && lassoStart) {
      setLassoEnd({ x, y });

      // Calculate which players are inside lasso box
      const minX = Math.min(lassoStart.x, x);
      const maxX = Math.max(lassoStart.x, x);
      const minY = Math.min(lassoStart.y, y);
      const maxY = Math.max(lassoStart.y, y);

      const playersInBox = players.filter(p =>
        p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
      ).map(p => p.id);

      setSelectedPlayers(playersInBox);
      return;
    }

    // Case 4: Route preview
    if (drawStart && routeType) {
      setDrawEnd({ x, y });
    }
  }

  function handleCanvasContextMenu(e) {
    e.preventDefault();
    if (isBallPassingMode) {
      finalizeBallSequence();
    }
  }

  function handleCanvasMouseUp(e) {
    // Case 0: Offsides tab drag end
    if (isDraggingOffsideTab) {
      setIsDraggingOffsideTab(false);
      return;
    }

    // Case 1: Single drag end
    if (isDragging) {
      setIsDragging(false);
      setDraggedPlayer(null);
      return;
    }

    // Case 2: Group drag end - commit positions
    if (isGroupDragging) {
      const { x, y } = getScaledCoordinates(e);
      const deltaX = x - groupDragStart.x;
      const deltaY = y - groupDragStart.y;

      setPlayers(prevPlayers => prevPlayers.map(p => {
        if (selectedPlayers.includes(p.id)) {
          return {
            ...p,
            startX: p.x,
            startY: p.y
          };
        }
        return p;
      }));

      setIsGroupDragging(false);
      setGroupDragStart(null);
      return;
    }

    // Case 3: Lasso end - keep selection
    if (isLassoing) {
      setIsLassoing(false);
      setLassoStart(null);
      setLassoEnd(null);
      // selectedPlayers already set during mousemove
      return;
    }

    // Case 4: Route drawing
    if (routeType && drawStart) {
      const { x, y } = getScaledCoordinates(e);

      if (selectedPlayer !== null) {
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
          direction: routeType === 'post' ? postAngle : 1
        };
        const length = calculateRouteLength(newRoute);
        const duration = calculateRouteDuration(length);
        newRoute.length = length;
        newRoute.duration = duration;
        setRoutes([...routes.filter(r => r.playerId !== selectedPlayer), newRoute]);
      }

      setDrawStart(null);
      setDrawEnd(null);
      setRouteType(null);
      setSelectedPlayer(null);
      setSelectedBall(false);
      setPostAngle(1); // Reset to default (right)
    }
  }

  function handlePopupRouteSelection(routeTypeSelected) {
    if (!popupMenu) return;

    const player = players.find(p => p.id === popupMenu.playerId);
    if (!player) return;

    // Show angle menu if post is selected
    if (routeTypeSelected === 'post') {
      setShowPostAngleMenu(true);
      return;
    }

    setRouteType(routeTypeSelected);
    setDrawStart({ x: player.x, y: player.y });
    setPopupMenu(null);
    setShowPostAngleMenu(false);
    setSelectedPlayer(popupMenu.playerId);
  }

  function handlePostAngleSelection(angle) {
    if (!popupMenu) return;

    const player = players.find(p => p.id === popupMenu.playerId);
    if (!player) return;

    setPostAngle(angle);
    setRouteType('post');
    setDrawStart({ x: player.x, y: player.y });
    setPopupMenu(null);
    setShowPostAngleMenu(false);
    setSelectedPlayer(popupMenu.playerId);
  }

  function closePopupMenu() {
    setPopupMenu(null);
    setSelectedPlayer(null);
    setShowPostAngleMenu(false);
  }

  function resetPlay() {
    const newPlayers = initPlayers(formation);
    setPlayers(newPlayers);
    setRoutes([]);
    setBallSequence([]);

    const teamAPlayers = newPlayers.filter(p => p.team === 'A');
    const teamBPlayers = newPlayers.filter(p => p.team === 'B');
    const teamAMinY = Math.min(...teamAPlayers.map(p => p.startY));
    const teamBMaxY = Math.max(...teamBPlayers.map(p => p.startY));
    const centerLine = (teamAMinY + teamBMaxY) / 2;
    setOffsideLine(centerLine);
    const newBall = { x: FIELD_WIDTH / 2, y: teamAMinY - 10, startX: FIELD_WIDTH / 2, startY: teamAMinY - 10 };
    setBall(newBall);

    setFrame(0);
    setIsPlaying(false);
    setBallMoved(false);
    setIsPlaybackActive(false);
    setSelectedPlayer(null);
    setSelectedBall(false);
    setSelectedPlayers([]);
    setIsBallPassingMode(false);
    setBallSequenceBuilder([]);
    setLastBallPosition(null);
  }

  async function savePlay() {
    if (!user) {
      alert('Please sign in to save plays');
      return;
    }
    if (!playName.trim()) {
      alert('Enter a play name');
      return;
    }

    try {
      const playData = {
        name: playName,
        formation,
        routes,
        ball_sequence: ballSequence,
        players: players.map(p => ({ ...p, startX: p.startX, startY: p.startY })),
        ball: { ...ball, x: ball.startX, y: ball.startY },
        offside_line: offsideLine
      };

      const { error } = await supabase
        .from('plays')
        .upsert(
          { ...playData, user_id: user.id },
          { onConflict: 'user_id,name' }
        );

      if (error) throw error;
      alert('Play saved successfully');
    } catch (error) {
      alert('Error saving play: ' + error.message);
    }
  }

  const loadPlay = async () => {
    if (!user) {
      alert('Please sign in to load plays');
      return;
    }

    const name = prompt('Enter play name to load:');
    if (!name) return;

    try {
      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', name)
        .single();

      if (error) throw error;
      if (!data) {
        alert('Play not found');
        return;
      }

      setPlayName(data.name);

      const migratedRoutes = (data.routes || []).map(route => {
        if (route.duration) return route;
        const length = calculateRouteLength(route);
        const duration = calculateRouteDuration(length);
        return { ...route, length, duration };
      });
      setRoutes(migratedRoutes);

      if (data.ball_sequence) {
        setBallSequence(data.ball_sequence);
      } else {
        setBallSequence([]);
      }

      setPlayers(data.players);
      setBall(data.ball || { x: 300, y: 750, startX: 300, startY: 750 });
      setFormation(data.formation);
      setOffsideLine(data.offside_line || 750);
      setFrame(0);
      setBallMoved(false);
      setIsPlaying(false);
      alert('Play loaded');
    } catch (error) {
      alert('Error loading play: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Rugby Play Designer</h1>
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                {!isSignUp && (
                  <>
                    <input
                      type="email"
                      placeholder="Email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
                    />
                    <button
                      onClick={handleSignIn}
                      disabled={authLoading}
                      className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    >
                      <LogIn size={18} /> Sign In
                    </button>
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      Sign Up
                    </button>
                  </>
                )}
                {isSignUp && (
                  <>
                    <input
                      type="email"
                      placeholder="Email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
                    />
                    <button
                      onClick={handleSignUp}
                      disabled={authLoading}
                      className="bg-green-600 px-3 py-2 rounded hover:bg-green-700 text-sm font-medium"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => setIsSignUp(false)}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      Back to Sign In
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="bg-gray-800 px-3 py-2 rounded"
          >
            <option value="scrum">Scrum</option>
            <option value="lineoutLeft">Lineout (Left)</option>
            <option value="lineoutRight">Lineout (Right)</option>
            <option value="freePlay">Free Play</option>
            <option value="sevens">Sevens</option>
          </select>

          {ballSequence.length > 0 && !isBallPassingMode && (
            <button
              onClick={() => setBallSequence([])}
              className="bg-red-600 px-3 py-2 rounded hover:bg-red-700"
            >
              Clear Ball Route
            </button>
          )}

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const newIsPlaying = !isPlaying;
                setIsPlaying(newIsPlaying);
                if (newIsPlaying) setIsPlaybackActive(true);
                if (frame === maxFrames) { resetPlay(); }
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
              onClick={() => setFrame(Math.min(maxFrames, frame + 1))}
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
          {formation === 'lineoutLeft' && 'Lineout - Left Sideline Throw'}
          {formation === 'lineoutRight' && 'Lineout - Right Sideline Throw'}
          {formation === 'freePlay' && 'Free Play (Post-Ruck)'}
          {formation === 'sevens' && 'Sevens (Two Pods + Center)'}
        </div>

        <div className="relative w-full flex justify-center">
          <canvas
            ref={canvasRef}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            style={{ width: '100%', maxWidth: '1200px', height: 'auto' }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={handleCanvasContextMenu}
            className="border-2 border-gray-700 rounded cursor-crosshair"
          />
          {popupMenu && canvasRef.current && (
            <div
              style={{
                position: 'absolute',
                left: `${(popupMenu.x / FIELD_WIDTH) * canvasRef.current.getBoundingClientRect().width}px`,
                top: `${(popupMenu.y / FIELD_HEIGHT) * canvasRef.current.getBoundingClientRect().height}px`,
                transform: 'translate(-50%, calc(-100% - 15px))',
                zIndex: 1000,
                pointerEvents: 'auto'
              }}
              className="bg-gray-800 rounded-lg shadow-xl border-2 border-yellow-500 p-2 flex gap-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {!showPostAngleMenu ? (
                <>
                  <button
                    onClick={() => handlePopupRouteSelection('straight')}
                    className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Straight
                  </button>
                  <button
                    onClick={() => handlePopupRouteSelection('post')}
                    className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Post
                  </button>
                  <button
                    onClick={() => handlePopupRouteSelection('arc')}
                    className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Arc
                  </button>
                  <button
                    onClick={closePopupMenu}
                    className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handlePostAngleSelection(-1)}
                    className="bg-green-600 px-3 py-2 rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Post Left
                  </button>
                  <button
                    onClick={() => handlePostAngleSelection(1)}
                    className="bg-green-600 px-3 py-2 rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Post Right
                  </button>
                  <button
                    onClick={() => setShowPostAngleMenu(false)}
                    className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-700 text-sm font-medium"
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isBallPassingMode && (
          <div className="mt-2 mb-2 p-3 bg-yellow-600 rounded text-white font-semibold">
            Ball Passing Mode Active
            {ballSequenceBuilder.length > 0 && (
              <span> - {ballSequenceBuilder.length} pass(es) added</span>
            )}
            <span className="block text-sm mt-1">
              Click players to add passes | Right-click or ESC to finish
            </span>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          <p><strong>1. Reposition:</strong> Click and drag any player to move them to a new starting position</p>
          <p><strong>2. Lasso Select:</strong> Click-drag empty space to select multiple players, then drag any selected player to move the group</p>
          <p><strong>3. Draw Routes (Players):</strong> Double-click a player to open route menu, select route type, then drag on field</p>
          <p><strong>4. Draw Ball Passes:</strong> Click ball to start, then click players in sequence (9→10→12). Right-click or ESC to finish.</p>
          <p><strong>5. Playback:</strong> Use play button to animate (ball moves 2.5x faster than players)</p>
          <p><strong>6. Offsides:</strong> Orange line enforced until ball moves - Team A cannot cross early (red highlight)</p>
          <p><strong>7. Reset:</strong> Returns all players to selected formation baseline (Scrum/Lineout/Free Play)</p>
        </div>
      </div>
    </div>
  );
}

export default App;
