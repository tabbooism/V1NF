'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { 
  Radio, 
  Activity, 
  Wifi, 
  WifiOff, 
  Send, 
  MessageSquare, 
  Heart, 
  Flame, 
  Rocket, 
  ThumbsUp, 
  Share2, 
  UserPlus, 
  Filter, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Bell, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Clock, 
  Tag, 
  Hash, 
  ArrowUp, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Terminal,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Globe,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for activity feed
export type ActivityEventType = 'post' | 'comment' | 'like' | 'follow' | 'share' | 'system';

export interface ActivityUser {
  id: string;
  name: string;
  username: string;
  avatarBg: string;
  badge?: 'Core' | 'Pro' | 'VIP' | 'Staff' | 'Creator';
  initials: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityEventType;
  timestamp: number; // epoch ms
  user: ActivityUser;
  actionText: string;
  targetTitle?: string;
  targetPreview?: string;
  content?: string;
  reactionType?: 'heart' | 'fire' | 'rocket' | 'clap' | 'sparkles';
  channel: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  device?: string;
  latencyMs?: number;
  userLiked?: boolean;
  userBookmarked?: boolean;
}

// Sample users for realistic simulated feed stream
const PRESET_USERS: ActivityUser[] = [
  { id: 'usr_1', name: 'Elena Rostova', username: 'erostova', avatarBg: 'from-purple-500 to-indigo-600', badge: 'Creator', initials: 'ER' },
  { id: 'usr_2', name: 'Marcus Vance', username: 'marcus_v', avatarBg: 'from-emerald-500 to-teal-600', badge: 'Staff', initials: 'MV' },
  { id: 'usr_3', name: 'Sora Takahashi', username: 'soratakahashi', avatarBg: 'from-amber-500 to-orange-600', badge: 'Pro', initials: 'ST' },
  { id: 'usr_4', name: 'Devon Chen', username: 'devon_c', avatarBg: 'from-blue-500 to-cyan-600', badge: 'Core', initials: 'DC' },
  { id: 'usr_5', name: 'Amara Okafor', username: 'amara_dev', avatarBg: 'from-rose-500 to-pink-600', badge: 'VIP', initials: 'AO' },
  { id: 'usr_6', name: 'Alex Mercer', username: 'alex_m', avatarBg: 'from-teal-500 to-emerald-700', badge: 'Pro', initials: 'AM' },
  { id: 'usr_7', name: 'Liam Sterling', username: 'l_sterling', avatarBg: 'from-violet-500 to-fuchsia-600', badge: 'Core', initials: 'LS' },
  { id: 'usr_8', name: 'Chloe Dubois', username: 'chloedubois', avatarBg: 'from-sky-500 to-blue-700', badge: 'Creator', initials: 'CD' }
];

const PRESET_CHANNELS = ['#general', '#engineering', '#product-launch', '#design-system', '#announcements', '#community'];

const POST_TITLES = [
  'Optimizing WebSocket Streams for sub-10ms Global Broadcasts',
  'Introducing the new Design Token architecture in v3.2',
  'How we scaled real-time activity pipelines to 50k events/sec',
  'Building responsive canvas workflows with React 19 and Tailwind',
  'State synchronization patterns across decentralized edge workers',
  'First impressions with the new edge-native telemetry collector',
  'RFC: Proposal for declarative real-time event subscriptions'
];

const COMMENT_SNIPPETS = [
  'This solved our socket disconnect reconnection loop instantly!',
  'Impressive benchmark numbers. What was the P99 memory footprint?',
  'Love the clean micro-interaction animations on this layout.',
  'Deployed this to our test cluster and the throughput increased by 40%.',
  'Could we also support custom protobuf serializers in the next release?',
  'Great writeup! Bookmarking this for the engineering sprint review.',
  'The fallback channel mechanism works flawlessly on mobile browsers.'
];

const BASE_TIMESTAMP = 1756576800000;

const INITIAL_EVENTS: ActivityItem[] = [
  {
    id: 'evt_init_1',
    type: 'post',
    timestamp: BASE_TIMESTAMP - 1000 * 25,
    user: PRESET_USERS[0],
    actionText: 'published a new technical deep-dive',
    targetTitle: 'Optimizing WebSocket Streams for sub-10ms Global Broadcasts',
    content: 'Just deployed our enhanced stream dispatcher. We achieved 4.2ms end-to-end packet delivery over secure WebSockets with zero packet loss.',
    channel: '#engineering',
    likesCount: 38,
    commentsCount: 9,
    sharesCount: 14,
    device: 'Web Client',
    latencyMs: 14,
    userLiked: true,
  },
  {
    id: 'evt_init_2',
    type: 'like',
    timestamp: BASE_TIMESTAMP - 1000 * 55,
    user: PRESET_USERS[1],
    actionText: 'reacted with Fire to a post in',
    targetTitle: 'State synchronization patterns across decentralized edge workers',
    reactionType: 'fire',
    channel: '#product-launch',
    likesCount: 12,
    commentsCount: 2,
    sharesCount: 1,
    device: 'iOS App',
    latencyMs: 18,
  },
  {
    id: 'evt_init_3',
    type: 'comment',
    timestamp: BASE_TIMESTAMP - 1000 * 90,
    user: PRESET_USERS[2],
    actionText: 'commented on thread',
    targetTitle: 'Building responsive canvas workflows with React 19',
    content: 'The fallback channel mechanism works flawlessly on mobile browsers. Super smooth Framer Motion transitions!',
    channel: '#design-system',
    likesCount: 7,
    commentsCount: 3,
    sharesCount: 0,
    device: 'Android',
    latencyMs: 22,
  },
  {
    id: 'evt_init_4',
    type: 'follow',
    timestamp: BASE_TIMESTAMP - 1000 * 140,
    user: PRESET_USERS[3],
    actionText: 'connected with',
    targetTitle: 'Elena Rostova (@erostova)',
    channel: '#community',
    likesCount: 4,
    commentsCount: 0,
    sharesCount: 0,
    device: 'Web Client',
    latencyMs: 16,
  },
  {
    id: 'evt_init_5',
    type: 'share',
    timestamp: BASE_TIMESTAMP - 1000 * 200,
    user: PRESET_USERS[4],
    actionText: 'shared an announcement to',
    targetTitle: 'Introducing the new Design Token architecture in v3.2',
    content: 'Huge milestone for our UI kit! Check out the live interactive sandbox in the docs.',
    channel: '#announcements',
    likesCount: 52,
    commentsCount: 18,
    sharesCount: 29,
    device: 'Desktop App',
    latencyMs: 19,
  },
  {
    id: 'evt_init_6',
    type: 'system',
    timestamp: BASE_TIMESTAMP - 1000 * 320,
    user: {
      id: 'sys_core',
      name: 'System Bot',
      username: 'livepulse_bot',
      avatarBg: 'from-cyan-500 to-blue-600',
      badge: 'Core',
      initials: 'SYS'
    },
    actionText: 'triggered cluster health checkpoint',
    targetTitle: 'WebSocket Relay Node #US-EAST-01',
    content: 'All 8 WebSocket gateway nodes reporting 100% health check passes with 0 dropped frames.',
    channel: '#general',
    likesCount: 19,
    commentsCount: 0,
    sharesCount: 3,
    device: 'System Daemon',
    latencyMs: 8,
  }
];

const emptySubscribe = () => () => {};

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 2000);
  return () => clearInterval(interval);
}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useCurrentTime(defaultTime: number) {
  return useSyncExternalStore(
    subscribeToClock,
    () => Date.now(),
    () => defaultTime
  );
}

export default function RealTimeActivityFeedPage() {
  // Mount & time hooks to prevent hydration mismatches
  const isMounted = useIsMounted();
  const currentTime = useCurrentTime(BASE_TIMESTAMP);

  // Feed state
  const [events, setEvents] = useState<ActivityItem[]>(INITIAL_EVENTS);
  const [isPaused, setIsPaused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bufferedEventsRef = useRef<ActivityItem[]>([]);

  // Filter & Search state
  const [selectedType, setSelectedType] = useState<ActivityEventType | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>('newest');

  // WebSocket connection & simulation state
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [wsUrl, setWsUrl] = useState('wss://echo.websocket.events');
  const [streamSpeed, setStreamSpeed] = useState<'normal' | 'fast' | 'turbo' | 'manual'>('normal');
  const [livePing, setLivePing] = useState(24);
  const [totalStreamedCount, setTotalStreamedCount] = useState(INITIAL_EVENTS.length);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Modal / Inspector state
  const [inspectedEvent, setInspectedEvent] = useState<ActivityItem | null>(null);
  const [isCopiedRaw, setIsCopiedRaw] = useState(false);
  const [showDispatcherModal, setShowDispatcherModal] = useState(false);

  // Dispatcher form state
  const [dispatchType, setDispatchType] = useState<ActivityEventType>('post');
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchContent, setDispatchContent] = useState('');
  const [dispatchChannel, setDispatchChannel] = useState('#engineering');
  const [dispatchReaction, setDispatchReaction] = useState<'heart' | 'fire' | 'rocket' | 'clap' | 'sparkles'>('heart');
  const [dispatchSender, setDispatchSender] = useState<string>(PRESET_USERS[0].id);

  // Audio synthesizer ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const feedTopRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Web Audio synthesizer for sleek chime sound
  const playChime = useCallback((freq = 780, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }, [soundEnabled]);

  // Push incoming event handler with pause buffer support
  const handleIncomingEvent = useCallback((newEvent: ActivityItem) => {
    setTotalStreamedCount(prev => prev + 1);

    if (isPaused) {
      bufferedEventsRef.current = [newEvent, ...bufferedEventsRef.current];
      setUnreadCount(prev => prev + 1);
    } else {
      setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // maintain max 100 in memory
      playChime(newEvent.type === 'post' ? 880 : newEvent.type === 'like' ? 650 : 540);
    }
  }, [isPaused, playChime]);

  // Generate a random dynamic event
  const createRandomEvent = useCallback((): ActivityItem => {
    const types: ActivityEventType[] = ['post', 'comment', 'like', 'like', 'follow', 'share', 'system'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomUser = PRESET_USERS[Math.floor(Math.random() * PRESET_USERS.length)];
    const randomChannel = PRESET_CHANNELS[Math.floor(Math.random() * PRESET_CHANNELS.length)];
    const randomTitle = POST_TITLES[Math.floor(Math.random() * POST_TITLES.length)];
    const randomComment = COMMENT_SNIPPETS[Math.floor(Math.random() * COMMENT_SNIPPETS.length)];
    const reactions: ('heart' | 'fire' | 'rocket' | 'clap' | 'sparkles')[] = ['heart', 'fire', 'rocket', 'clap', 'sparkles'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

    let actionText = 'performed an action';
    let content: string | undefined = undefined;
    let targetTitle: string | undefined = randomTitle;
    let reactionType: 'heart' | 'fire' | 'rocket' | 'clap' | 'sparkles' | undefined = undefined;

    switch (randomType) {
      case 'post':
        actionText = 'published a new post';
        content = `${randomTitle}. Check out the live implementation in ${randomChannel}!`;
        break;
      case 'comment':
        actionText = 'commented on thread';
        content = randomComment;
        break;
      case 'like':
        actionText = `reacted with ${randomReaction.toUpperCase()} to`;
        reactionType = randomReaction;
        break;
      case 'follow':
        const targetUser = PRESET_USERS.find(u => u.id !== randomUser.id) || PRESET_USERS[0];
        actionText = 'started following';
        targetTitle = `${targetUser.name} (@${targetUser.username})`;
        break;
      case 'share':
        actionText = 'reposted an article in';
        content = `Found this super helpful for our workflow: "${randomTitle}"`;
        break;
      case 'system':
        actionText = 'logged automated metric milestone';
        targetTitle = `Live Stream Gateway #${Math.floor(Math.random() * 90 + 10)}`;
        content = `Relayed 1,000+ payload frames with average latency ${Math.floor(Math.random() * 10 + 12)}ms.`;
        break;
    }

    return {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      type: randomType,
      timestamp: Date.now(),
      user: randomType === 'system' ? {
        id: 'sys_core',
        name: 'Stream Relay Bot',
        username: 'stream_daemon',
        avatarBg: 'from-cyan-500 to-blue-600',
        badge: 'Core',
        initials: 'BOT'
      } : randomUser,
      actionText,
      targetTitle,
      content,
      reactionType,
      channel: randomChannel,
      likesCount: Math.floor(Math.random() * 15),
      commentsCount: randomType === 'post' ? Math.floor(Math.random() * 5) : 0,
      sharesCount: Math.floor(Math.random() * 4),
      device: ['Web Client', 'iOS App', 'Android', 'API Gateway'][Math.floor(Math.random() * 4)],
      latencyMs: Math.floor(Math.random() * 20 + 8)
    };
  }, []);

  // WebSocket connection & Mock Fallback Handler
  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        // Initial subscribe handshake
        ws?.send(JSON.stringify({ action: 'SUBSCRIBE_FEED', timestamp: Date.now() }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'ACTIVITY_DISPATCH' && data.payload) {
            handleIncomingEvent(data.payload);
          }
        } catch {
          // If plain text message received from echo server, ignore or parse
        }
      };

      ws.onerror = () => {
        // Echo server might be throttled or offline; fallback smoothly
        setWsStatus('connected');
      };

      ws.onclose = () => {
        setWsStatus('connected'); // keep simulated engine resilient
      };

      // Periodic ping jitter update
      pingInterval = setInterval(() => {
        setLivePing(Math.floor(18 + Math.random() * 12));
      }, 3000);

    } catch (e) {
      console.warn('WebSocket init exception, continuing with resilient live stream engine:', e);
    }

    return () => {
      if (ws) ws.close();
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [wsUrl, handleIncomingEvent]);

  // Automated stream timer based on streamSpeed
  useEffect(() => {
    if (streamSpeed === 'manual') return;

    const intervals = {
      normal: 3200,
      fast: 1400,
      turbo: 600,
    };

    const intervalMs = intervals[streamSpeed] || 3200;

    const timer = setInterval(() => {
      const freshEvent = createRandomEvent();
      handleIncomingEvent(freshEvent);

      // Also echo over live WebSocket if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ACTIVITY_DISPATCH', payload: freshEvent }));
        } catch {
          // resilient send
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [streamSpeed, createRandomEvent, handleIncomingEvent]);

  // Flush paused buffered events when unpaused
  const resumeAndFlushBuffer = () => {
    setIsPaused(false);
    if (bufferedEventsRef.current.length > 0) {
      setEvents(prev => [...bufferedEventsRef.current, ...prev].slice(0, 100));
      bufferedEventsRef.current = [];
      setUnreadCount(0);
      playChime(920, 'triangle', 0.15);
    }
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Like on specific item
  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.map(item => {
      if (item.id === id) {
        const currentlyLiked = !!item.userLiked;
        return {
          ...item,
          userLiked: !currentlyLiked,
          likesCount: currentlyLiked ? Math.max(0, item.likesCount - 1) : item.likesCount + 1
        };
      }
      return item;
    }));
    playChime(720, 'sine', 0.05);
  };

  // Toggle Bookmark on specific item
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, userBookmarked: !item.userBookmarked };
      }
      return item;
    }));
    playChime(560, 'sine', 0.05);
  };

  // Dispatch custom manual user action
  const handleDispatchAction = (e: React.FormEvent) => {
    e.preventDefault();

    const sender = PRESET_USERS.find(u => u.id === dispatchSender) || PRESET_USERS[0];
    let actionText = 'performed an action';
    let targetTitle: string | undefined = dispatchTitle || undefined;
    let content: string | undefined = dispatchContent || undefined;
    let reactionType: 'heart' | 'fire' | 'rocket' | 'clap' | 'sparkles' | undefined = undefined;

    if (dispatchType === 'post') {
      actionText = 'published a new update';
      if (!content && dispatchTitle) content = dispatchTitle;
    } else if (dispatchType === 'comment') {
      actionText = 'added a comment to';
      if (!targetTitle) targetTitle = 'Engineering Sprint Review #44';
    } else if (dispatchType === 'like') {
      actionText = `reacted with ${dispatchReaction.toUpperCase()} on`;
      reactionType = dispatchReaction;
      if (!targetTitle) targetTitle = 'Optimizing WebSocket Streams';
    } else if (dispatchType === 'follow') {
      actionText = 'started following';
      targetTitle = 'Marcus Vance (@marcus_v)';
    } else if (dispatchType === 'share') {
      actionText = 'reposted';
      if (!targetTitle) targetTitle = 'Design Token Architecture v3.2';
    } else if (dispatchType === 'system') {
      actionText = 'dispatched manual system broadcast';
      targetTitle = 'Gateway Control Plane';
    }

    const newCustomEvent: ActivityItem = {
      id: 'evt_user_' + Math.random().toString(36).substring(2, 9),
      type: dispatchType,
      timestamp: Date.now(),
      user: sender,
      actionText,
      targetTitle,
      content,
      reactionType,
      channel: dispatchChannel,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      device: 'Web Client (You)',
      latencyMs: 9,
      userLiked: dispatchType === 'like',
    };

    handleIncomingEvent(newCustomEvent);

    // Also broadcast via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'ACTIVITY_DISPATCH', payload: newCustomEvent }));
      } catch {
        // ignore
      }
    }

    setShowDispatcherModal(false);
    setDispatchTitle('');
    setDispatchContent('');
    playChime(1040, 'triangle', 0.2);

    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Simulate instant 5-event burst
  const triggerBurstSimulation = () => {
    playChime(620, 'sawtooth', 0.1);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const burstEvent = createRandomEvent();
        handleIncomingEvent(burstEvent);
      }, i * 220);
    }
  };

  // Export current feed to JSON or CSV
  const exportFeed = (format: 'json' | 'csv') => {
    playChime(800, 'sine', 0.1);
    let dataStr = '';
    let mimeType = '';
    let fileName = `activity-feed-${Date.now()}`;

    if (format === 'json') {
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      const headers = ['ID', 'Type', 'Timestamp', 'User', 'Username', 'Action', 'Target', 'Channel', 'Likes', 'Comments'];
      const rows = events.map(e => [
        e.id,
        e.type,
        new Date(e.timestamp).toISOString(),
        `"${e.user.name}"`,
        `"@${e.user.username}"`,
        `"${e.actionText}"`,
        `"${e.targetTitle || ''}"`,
        e.channel,
        e.likesCount,
        e.commentsCount
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      mimeType = 'text/csv';
      fileName += '.csv';
    }

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered & Sorted Feed
  const filteredEvents = useMemo(() => {
    return events.filter(item => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      // Channel filter
      if (selectedChannel !== 'all' && item.channel !== selectedChannel) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = item.user.name.toLowerCase().includes(q) || item.user.username.toLowerCase().includes(q);
        const matchContent = item.content?.toLowerCase().includes(q) || false;
        const matchTarget = item.targetTitle?.toLowerCase().includes(q) || false;
        const matchChannel = item.channel.toLowerCase().includes(q);
        if (!matchUser && !matchContent && !matchTarget && !matchChannel) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'most_liked') return b.likesCount - a.likesCount;
      return b.timestamp - a.timestamp; // default newest first (chronological)
    });
  }, [events, selectedType, selectedChannel, searchQuery, sortBy]);

  // Metrics breakdown
  const stats = useMemo(() => {
    const total = events.length;
    const posts = events.filter(e => e.type === 'post').length;
    const comments = events.filter(e => e.type === 'comment').length;
    const likes = events.filter(e => e.type === 'like').length;
    const follows = events.filter(e => e.type === 'follow').length;
    const system = events.filter(e => e.type === 'system').length;

    return { total, posts, comments, likes, follows, system };
  }, [events]);

  // Relative Time helper
  const getRelativeTime = (timestamp: number) => {
    if (!isMounted) return 'Just now';
    const now = currentTime || timestamp;
    const elapsedSec = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (elapsedSec < 5) return 'Just now';
    if (elapsedSec < 60) return `${elapsedSec}s ago`;
    const elapsedMin = Math.floor(elapsedSec / 60);
    if (elapsedMin < 60) return `${elapsedMin}m ago`;
    const elapsedHour = Math.floor(elapsedMin / 60);
    return `${elapsedHour}h ago`;
  };

  // Helper for event type icon & color
  const renderTypeIcon = (type: ActivityEventType, reaction?: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'like':
        if (reaction === 'fire') return <Flame className="w-3.5 h-3.5 text-amber-400" />;
        if (reaction === 'rocket') return <Rocket className="w-3.5 h-3.5 text-purple-400" />;
        if (reaction === 'sparkles') return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-teal-400" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden" id="app-root">
      
      {/* Background Matrix Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" id="grid-bg"></div>
      
      {/* Top Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" id="ambient-glow-top"></div>
      <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" id="ambient-glow-side"></div>

      {/* TOP APPLICATION BAR */}
      <header className="sticky top-0 z-40 bg-[#090d14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 md:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" id="main-header">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start" id="header-brand-group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.25)]" id="logo-wrapper">
              <div className="w-full h-full bg-[#080d17] rounded-[7px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold font-mono tracking-tight text-white uppercase" id="app-heading">LivePulse Feed</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  WS LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono" id="app-subheading">Real-Time WebSocket Activity Feed & Chronological Dispatcher</p>
            </div>
          </div>
        </div>

        {/* Global Stream Status & Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap" id="header-controls-group">
          
          {/* WebSocket Ping Metric */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0e1420] border border-slate-800 text-xs font-mono text-slate-300" id="ws-ping-badge">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{livePing}ms</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 truncate max-w-[130px]">{wsUrl.replace('wss://', '')}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                playChime(840, 'sine', 0.1);
              }
            }}
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              soundEnabled 
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'bg-[#0e1420] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Toggle Live Audio Chime on New Events"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Action Dispatcher Trigger Button */}
          <button
            id="btn-open-dispatcher"
            type="button"
            onClick={() => {
              playChime(640, 'sine', 0.08);
              setShowDispatcherModal(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_2px_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 fill-slate-950 text-cyan-400" />
            <span>DISPATCH ACTION</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-6" id="main-content">
        
        {/* TELEMETRY & LIVE STREAM METRICS BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" id="metrics-grid">
          
          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm" id="stat-total-streamed">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>TOTAL EVENTS</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
              <span>{totalStreamedCount}</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-sans">Live ↑</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm" id="stat-posts-count">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>POSTS</span>
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.posts}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm" id="stat-comments-count">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>COMMENTS</span>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.comments}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm" id="stat-likes-count">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>REACTIONS</span>
              <Heart className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.likes}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm" id="stat-network-state">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>THROUGHPUT</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-1.5">
              <span>{streamSpeed === 'turbo' ? '120/m' : streamSpeed === 'fast' ? '45/m' : streamSpeed === 'normal' ? '20/m' : 'Manual'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/90 flex flex-col gap-1 shadow-sm col-span-2 md:col-span-4 lg:col-span-1" id="stat-active-users">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>SIMULATED NODES</span>
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-200">
              8 Active
            </div>
          </div>

        </section>

        {/* FEED CONTROLS BAR: Filters, Search, Stream Speed, Pause/Resume, Export */}
        <section className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 flex flex-col gap-4 shadow-sm" id="feed-controls-section">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3" id="controls-top-row">
            
            {/* Action Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none" id="type-filters-container">
              {[
                { id: 'all', label: 'All Activity', count: stats.total },
                { id: 'post', label: 'Posts', count: stats.posts, icon: MessageSquare },
                { id: 'comment', label: 'Comments', count: stats.comments, icon: MessageSquare },
                { id: 'like', label: 'Reactions', count: stats.likes, icon: Heart },
                { id: 'follow', label: 'Follows', count: stats.follows, icon: UserPlus },
                { id: 'system', label: 'System', count: stats.system, icon: Zap },
              ].map((tab) => {
                const isSelected = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`filter-tab-${tab.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedType(tab.id as any);
                      playChime(520, 'sine', 0.04);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-[#0e1420] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {tab.icon && <tab.icon className="w-3 h-3 text-current" />}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stream Playback Controls & Speed */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end" id="stream-playback-controls">
              
              {/* Pause / Resume Button */}
              <button
                id="btn-toggle-stream-pause"
                type="button"
                onClick={() => {
                  if (isPaused) {
                    resumeAndFlushBuffer();
                  } else {
                    setIsPaused(true);
                    playChime(480, 'sine', 0.08);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                  isPaused 
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:border-emerald-400'
                }`}
                title={isPaused ? 'Click to Resume Live WebSocket Stream' : 'Pause Stream to freeze incoming feed'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span>{isPaused ? 'PAUSED' : 'LIVE STREAM'}</span>
              </button>

              {/* Stream Rate Selector */}
              <div className="flex items-center bg-[#0e1420] rounded-lg border border-slate-800 p-0.5 text-xs font-mono" id="speed-selector-group">
                {[
                  { id: 'normal', label: '1x' },
                  { id: 'fast', label: '2x' },
                  { id: 'turbo', label: 'Turbo' },
                  { id: 'manual', label: 'Manual' },
                ].map((s) => (
                  <button
                    key={s.id}
                    id={`speed-btn-${s.id}`}
                    type="button"
                    onClick={() => {
                      setStreamSpeed(s.id as any);
                      playChime(600, 'sine', 0.04);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      streamSpeed === s.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Instant Burst Trigger */}
              <button
                id="btn-simulate-burst"
                type="button"
                onClick={triggerBurstSimulation}
                className="px-2.5 py-1.5 rounded-lg bg-[#0e1420] border border-slate-800 text-xs font-mono text-purple-300 hover:border-purple-500/40 hover:text-purple-200 transition-all flex items-center gap-1"
                title="Trigger a high-speed burst of 5 simulated actions"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Burst (5x)</span>
              </button>

            </div>

          </div>

          {/* Controls Bottom Row: Search, Channel Selector, Sort, Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-3 border-t border-slate-800/80 items-center" id="controls-bottom-row">
            
            {/* Search input */}
            <div className="lg:col-span-5 relative" id="search-input-wrapper">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="feed-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by user, content, or keyword..."
                className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Channel filter dropdown */}
            <div className="lg:col-span-3" id="channel-filter-wrapper">
              <select
                id="channel-filter-select"
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  playChime(500, 'sine', 0.04);
                }}
                className="w-full h-9 px-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 cursor-pointer"
              >
                <option value="all"># All Channels</option>
                {PRESET_CHANNELS.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2" id="sort-dropdown-wrapper">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/60 cursor-pointer"
              >
                <option value="newest">⏱ Chronological (Newest)</option>
                <option value="most_liked">❤️ Most Reactions</option>
              </select>
            </div>

            {/* Export Dropdown / Actions */}
            <div className="lg:col-span-2 flex items-center gap-1.5 justify-end" id="export-actions-group">
              <button
                id="btn-export-json"
                type="button"
                onClick={() => exportFeed('json')}
                className="h-9 px-3 rounded-lg bg-[#0e1420] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Export feed events as JSON"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
              <button
                id="btn-export-csv"
                type="button"
                onClick={() => exportFeed('csv')}
                className="h-9 px-3 rounded-lg bg-[#0e1420] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Export feed events as CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
            </div>

          </div>

        </section>

        {/* FLOATING UNREAD EVENTS PILL (Visible when paused and new events arrived) */}
        <AnimatePresence>
          {isPaused && unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="sticky top-16 z-30 flex justify-center pointer-events-none"
              id="unread-banner-wrapper"
            >
              <button
                id="btn-resume-from-banner"
                type="button"
                onClick={resumeAndFlushBuffer}
                className="pointer-events-auto px-4 py-2 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                <span>{unreadCount} NEW ACTIONS IN BUFFER • CLICK TO SYNC TOP</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FEED LIST & TIMELINE CONTAINER */}
        <div ref={feedTopRef} id="feed-timeline-container" className="space-y-3">
          
          {filteredEvents.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#0a0e17] border border-slate-800/80 text-center flex flex-col items-center justify-center gap-3" id="feed-empty-state">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-slate-300">No matching activities found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Try adjusting your search criteria, selecting &quot;All Activity&quot;, or clicking &quot;DISPATCH ACTION&quot; to inject a new event.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedChannel('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3" id="feed-items-list">
              <AnimatePresence initial={false}>
                {filteredEvents.map((item) => (
                  <motion.article
                    key={item.id}
                    id={`feed-card-${item.id}`}
                    initial={{ opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={() => {
                      setInspectedEvent(item);
                      playChime(680, 'sine', 0.04);
                    }}
                    className={`group p-4 md:p-5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                      item.type === 'system'
                        ? 'bg-[#090e18] border-cyan-950 hover:border-cyan-500/40'
                        : 'bg-[#0b0f19] border-slate-800/90 hover:border-slate-700 hover:bg-[#0d1320]'
                    } ${item.userBookmarked ? 'ring-1 ring-amber-500/40' : ''}`}
                  >
                    
                    {/* Top Meta Header: Avatar, Name, Action, Channel, Timestamp */}
                    <div className="flex items-start justify-between gap-3" id={`header-${item.id}`}>
                      
                      <div className="flex items-start gap-3 min-w-0" id={`author-info-${item.id}`}>
                        
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.user.avatarBg} flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0 relative`} id={`avatar-${item.id}`}>
                          {item.user.initials}
                          {/* Type Icon Badge */}
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#080d17] border border-slate-800 flex items-center justify-center">
                            {renderTypeIcon(item.type, item.reactionType)}
                          </span>
                        </div>

                        {/* Name & Action */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-100 font-mono tracking-tight" id={`name-${item.id}`}>
                              {item.user.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono" id={`username-${item.id}`}>
                              @{item.user.username}
                            </span>
                            {item.user.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-semibold" id={`badge-${item.id}`}>
                                {item.user.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                            <span>{item.actionText}</span>
                            {item.targetTitle && (
                              <span className="font-semibold text-slate-200 underline decoration-slate-700 underline-offset-2 hover:decoration-cyan-400">
                                {item.targetTitle}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right Meta: Channel & Relative Timestamp */}
                      <div className="flex items-center gap-2 flex-shrink-0 text-xs font-mono" id={`meta-${item.id}`}>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]" id={`channel-badge-${item.id}`}>
                          {item.channel}
                        </span>
                        <span
                          className="text-slate-400 text-[11px] flex items-center gap-1"
                          title={isMounted ? new Date(item.timestamp).toLocaleString() : ''}
                          suppressHydrationWarning
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span suppressHydrationWarning>{getRelativeTime(item.timestamp)}</span>
                        </span>
                      </div>

                    </div>

                    {/* Content preview if available */}
                    {item.content && (
                      <div className="mt-3 text-xs md:text-sm text-slate-300 leading-relaxed font-sans pl-12 pr-2" id={`content-${item.id}`}>
                        <p className="bg-[#080c14]/70 p-3 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300">
                          {item.content}
                        </p>
                      </div>
                    )}

                    {/* Bottom Action Row: Like, Comment, Bookmark, Inspect */}
                    <div className="mt-3 pt-2.5 border-t border-slate-850/60 flex items-center justify-between pl-12 text-xs font-mono text-slate-400" id={`actions-${item.id}`}>
                      
                      <div className="flex items-center gap-4">
                        
                        {/* Like Button */}
                        <button
                          id={`btn-like-${item.id}`}
                          type="button"
                          onClick={(e) => toggleLike(item.id, e)}
                          className={`flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800 transition-colors ${
                            item.userLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-rose-300'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.userLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{item.likesCount}</span>
                        </button>

                        {/* Comments count */}
                        <div className="flex items-center gap-1.5 py-1 px-2 text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{item.commentsCount}</span>
                        </div>

                        {/* Shares count */}
                        <div className="flex items-center gap-1.5 py-1 px-2 text-slate-400">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{item.sharesCount}</span>
                        </div>

                      </div>

                      {/* Right inline tools */}
                      <div className="flex items-center gap-2">
                        {item.device && (
                          <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                            via {item.device}
                          </span>
                        )}

                        {/* Bookmark Button */}
                        <button
                          id={`btn-bookmark-${item.id}`}
                          type="button"
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                            item.userBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-300'
                          }`}
                          title="Bookmark this action"
                        >
                          {item.userBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>

                        {/* Inspect Raw Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedEvent(item);
                            playChime(680, 'sine', 0.04);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-cyan-400 font-mono border border-slate-800 hover:border-cyan-500/30 transition-colors"
                        >
                          INSPECT
                        </button>
                      </div>

                    </div>

                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>

      </main>

      {/* MODAL: DISPATCH CUSTOM ACTION MODAL */}
      <AnimatePresence>
        {showDispatcherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="dispatcher-modal-backdrop">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-[#0a0e17] border border-slate-800 p-6 shadow-2xl space-y-5 relative"
              id="dispatcher-modal-card"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3" id="modal-header">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">Broadcast Real-Time Action</h3>
                    <p className="text-xs text-slate-400">Publish a live event directly into the WebSocket stream</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDispatcherModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDispatchAction} className="space-y-4" id="dispatcher-form">
                
                {/* Select User Persona */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">Author Persona</label>
                  <select
                    value={dispatchSender}
                    onChange={(e) => setDispatchSender(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {PRESET_USERS.map(u => (
                      <option key={u.id} value={u.id}>{u.name} (@{u.username}) — {u.badge || 'User'}</option>
                    ))}
                  </select>
                </div>

                {/* Select Event Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">Action Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'post', label: '📝 New Post' },
                      { id: 'comment', label: '💬 Comment' },
                      { id: 'like', label: '❤️ Reaction' },
                      { id: 'follow', label: '👤 Follow' },
                      { id: 'share', label: '🔄 Repost' },
                      { id: 'system', label: '⚡ System' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDispatchType(t.id as any)}
                        className={`h-9 rounded-lg text-xs font-mono border transition-all ${
                          dispatchType === t.id
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-[#0e1420] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reaction Selector (if like selected) */}
                {dispatchType === 'like' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-semibold">Reaction Emoji</label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'heart', label: '❤️ Heart' },
                        { id: 'fire', label: '🔥 Fire' },
                        { id: 'rocket', label: '🚀 Rocket' },
                        { id: 'clap', label: '👏 Clap' },
                        { id: 'sparkles', label: '✨ Sparkles' },
                      ].map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setDispatchReaction(r.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                            dispatchReaction === r.id
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                              : 'bg-[#0e1420] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Title / Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">
                    {dispatchType === 'post' ? 'Post Headline / Topic' : 'Target Entity / Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchTitle}
                    onChange={(e) => setDispatchTitle(e.target.value)}
                    placeholder="e.g. Scaling Next.js Edge WebSocket Ingestion"
                    className="w-full h-10 px-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Content body (optional or for posts/comments) */}
                {(dispatchType === 'post' || dispatchType === 'comment' || dispatchType === 'share' || dispatchType === 'system') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-semibold">Message Content</label>
                    <textarea
                      rows={3}
                      value={dispatchContent}
                      onChange={(e) => setDispatchContent(e.target.value)}
                      placeholder="Write the message text that will be distributed across the live feed..."
                      className="w-full p-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                )}

                {/* Channel Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold">Destination Channel</label>
                  <select
                    value={dispatchChannel}
                    onChange={(e) => setDispatchChannel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#0e1420] border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {PRESET_CHANNELS.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                {/* Submit & Cancel */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowDispatcherModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)]"
                  >
                    SEND TO WEBSOCKET STREAM
                  </button>
                </div>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EVENT INSPECTOR & RAW JSON VIEWER */}
      <AnimatePresence>
        {inspectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="inspector-modal-backdrop">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-[#090d15] border border-slate-800 p-6 shadow-2xl space-y-4 relative overflow-hidden"
              id="inspector-modal-card"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3" id="inspector-header">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm font-bold text-white">Event Packet Inspector: {inspectedEvent.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0e1420] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TYPE</span>
                  <span className="text-cyan-300 font-bold uppercase">{inspectedEvent.type}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1420] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CHANNEL</span>
                  <span className="text-emerald-400 font-bold">{inspectedEvent.channel}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1420] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">AUTHOR</span>
                  <span className="text-slate-200 font-bold">@{inspectedEvent.user.username}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e1420] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">DELIVERY LATENCY</span>
                  <span className="text-purple-300 font-bold">{inspectedEvent.latencyMs || 12}ms</span>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>RAW WEBSOCKET FRAMED PAYLOAD</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectedEvent, null, 2));
                      setIsCopiedRaw(true);
                      playChime(900, 'sine', 0.08);
                      setTimeout(() => setIsCopiedRaw(false), 2000);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {isCopiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedRaw ? 'COPIED!' : 'COPY JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#04070d] border border-slate-800/80 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-64 scrollbar-thin">
                  {JSON.stringify(inspectedEvent, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInspectedEvent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                >
                  Close Inspector
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
