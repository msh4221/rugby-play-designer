# Rugby Play Designer

Interactive rugby play designer for coaching. Draw offensive and defensive routes for all 15 players per team, plus ball movement.

## Features

- **Field Visualization**: Vertical field (players move up/down), 1/3 rugby field length with horizontal yard lines
- **30 Players**: 15 per team (Team A = blue at bottom, Team B = red at top), numbered 1-15
- **Formation Presets**:
  - Scrum: Traditional 3-4-1 scrum formation with backs 10 yards behind (mirror for both teams)
  - Lineout: 5v5 vertical line formation with hookers on sideline, backs 10 yards back
  - Free Play: Post-ruck/breakdown positioning with players clustered around ruck area
- **Route Types**:
  - Straight: Direct line in any direction
  - Post: Straight line then 45° angle
  - Arc: Freehand curved path (Bézier curve)
- **Ball Movement**:
  - Draw ball routes independently
  - Ball moves 2.5x faster than players
  - Brown ball rendered separately
- **Offsides Rule**:
  - Orange dashed line at Team A starting position
  - Team A players cannot cross until ball moves
  - Violations highlighted in red
- **Playback**:
  - Auto-play with speed control (0.5x to 2x)
  - Frame-by-frame stepping (prev/next buttons)
  - Players stay at final position after playback
  - Reset button returns to starting formation
- **Save/Load**: Persist complete plays (player routes + ball routes) by name

## Setup

```bash
cd "Coding Projects/rugby-play-designer"
npm install
npm run dev
```

Open browser to http://localhost:5173

## Usage

### Workflow
1. **Select formation** (Scrum/Lineout/Free Play) - players appear in formation baseline
2. **Reposition players**: Click and drag any player to move them to desired starting position
3. **Draw routes**:
   - Click a player or ball to select
   - Choose route type (Straight/Post/Arc)
   - Click and drag on field to draw the route
4. **Repeat** for all players/ball as needed
5. **Playback**: Use play button to animate (ball moves 2.5x faster than players)
6. **Reset**: Returns all players to formation baseline and clears routes
7. **Save/Load**: Save complete plays with repositioned players and routes

### Rugby Rules
- **Offsides Line**: Orange dashed line enforced until ball moves
- **Violations**: Team A players cannot cross offsides line before ball moves (highlighted red)
- **Ball Speed**: Moves 2.5x faster than players to simulate realistic play timing

### Formations
- **Scrum**: Front row (1,2,3) on offsides line, second row (4,5,6,7) behind, #8 at back, backs 10 yards behind
- **Lineout**: 5 jumpers in vertical line, hookers on sideline, backs 10 yards back
- **Free Play**: Post-ruck cluster with forwards around breakdown, backs spreading out

## Dependencies

- React 18
- Vite (dev server)
- Tailwind CSS
- lucide-react (icons)

## Tech Stack

Single-file React component using Canvas API for field rendering. All state managed with React hooks. No external routing or state libraries needed.
