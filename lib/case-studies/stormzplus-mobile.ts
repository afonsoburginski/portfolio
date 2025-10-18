import { CaseStudy } from "./types";

export const stormzplusMobile: CaseStudy = {
  title: "Stormz+ Mobile – React Native App",
  description:
    "A production React Native application built with Expo that delivers the full Stormz+ streaming experience to iOS and Android devices. Features multi-profile support, offline downloads, native video playback, and seamless synchronization with the web platform using the same Supabase backend.",
  image: "/projects/stormzplus-app.png",
  role: "Mobile Developer",
  timeline: "2024–2025",
  stack:
    "React Native 0.79, Expo SDK 53, TypeScript, React Navigation, Supabase (Auth/DB), React Native Video, AsyncStorage, SWR, Zustand, Expo Router, React Native Reanimated, Lottie, i18next",
  liveUrl: "https://apps.apple.com/stormzplus",
  story:
    "I built the Stormz+ mobile app as a production React Native application using Expo to extend the streaming platform to mobile devices. The app shares the same Supabase backend as the web version, ensuring seamless data synchronization across all platforms. Built with modern React Native practices including Expo Router for navigation and native performance optimizations.",
  objectives: [
    "Create a production React Native app that mirrors the web platform's functionality using the same Supabase backend.",
    "Implement multi-profile support with seamless switching between user accounts using Supabase Auth.",
    "Enable offline content downloads using AsyncStorage and file system APIs for viewing without internet.",
    "Integrate native video player with HLS streaming using react-native-video for smooth playback.",
    "Implement real-time data synchronization using SWR for efficient state management.",
    "Ensure seamless authentication and subscription management integration with the web platform.",
  ],
  challenges: [
    {
      title: "Cross-platform video playback with Expo",
      detail:
        "Implemented native video playback using react-native-video and expo-video to ensure consistent HLS streaming experience across iOS and Android. Handled Expo's managed workflow constraints while maintaining smooth 60fps performance and adaptive bitrate streaming.",
    },
    {
      title: "Supabase integration and real-time sync",
      detail:
        "Integrated the same Supabase backend used by the web platform, implementing real-time subscriptions for watch progress, profile changes, and content updates. Used SWR for efficient data fetching and caching with automatic revalidation.",
    },
    {
      title: "Expo Router navigation and deep linking",
      detail:
        "Implemented file-based routing using Expo Router for seamless navigation and deep linking support. Created a comprehensive URL structure that allows users to share content and navigate directly to specific shows, episodes, or profiles.",
    },
  ],
  highlights: [
    "Production React Native app built with Expo SDK 53 and React Native 0.79.",
    "Shared Supabase backend ensuring real-time sync with web platform.",
    "Native video player with HLS streaming using react-native-video.",
    "Multi-profile system with individual watch progress using Supabase Auth.",
    "Offline downloads with AsyncStorage and intelligent cache management.",
    "File-based routing with Expo Router for seamless navigation.",
    "Real-time data synchronization using SWR for efficient state management.",
    "Cross-platform consistency with native performance optimizations.",
  ],
  outcomes: [
    "Production app ready for App Store and Google Play Store deployment.",
    "Achieved native performance with 60fps video playback using Expo managed workflow.",
    "Seamless integration with existing Supabase backend and web platform.",
    "Cross-platform codebase with Expo reducing development time significantly.",
    "Real-time synchronization of user data across web and mobile platforms.",
  ],
  sections: [
    {
      title: "Production App Demo",
      subsections: [
        "Multi-Profile Interface",
        "Content Discovery", 
        "Video Playback"
      ],
      body: [
        "The production React Native app provides a native streaming experience with intuitive navigation and smooth performance using Expo SDK 53.",
        "Multi-profile support allows family members to have personalized viewing experiences with individual watch progress and recommendations, all synced through Supabase.",
        "Advanced content discovery features help users find new shows and movies based on their viewing history and preferences, with real-time updates.",
      ],
      video: "/projects/stormzplus-app.mp4",
    },
    {
      title: "Technical Architecture",
      subsections: [
        "Expo & React Native Setup",
        "Supabase Integration",
        "State Management",
        "Video Streaming"
      ],
      body: [
        "Built with React Native 0.79 and Expo SDK 53 using the managed workflow for rapid development and easy deployment across platforms.",
        "Integrated the same Supabase backend as the web platform, ensuring seamless authentication, real-time data sync, and shared database access.",
        "Implemented SWR for efficient data fetching, caching, and real-time synchronization with automatic revalidation and Zustand for local state management.",
        "Native video player using react-native-video and expo-video ensures smooth HLS streaming with adaptive bitrate support and native performance.",
      ],
    },
    {
      title: "User Experience Features",
      subsections: [
        "Profile Management",
        "Offline Downloads",
        "Push Notifications",
        "Deep Linking"
      ],
      body: [
        "Seamless profile switching with individual watch progress, favorites, and personalized recommendations.",
        "Background download system allows users to download content for offline viewing with progress tracking.",
        "Smart push notifications for new episodes, recommendations, and account updates to increase engagement.",
        "Comprehensive deep linking system enables content sharing and direct navigation to specific shows or episodes.",
      ],
    },
    {
      title: "Performance Optimizations",
      subsections: [
        "Video Playback",
        "Memory Management",
        "Network Efficiency",
        "Battery Optimization"
      ],
      body: [
        "Native video player with hardware acceleration ensures smooth 60fps playback across all supported devices.",
        "Intelligent memory management with automatic cleanup of unused video segments and cached data.",
        "Network optimization through intelligent preloading and adaptive streaming based on connection quality.",
        "Battery optimization through efficient background processing and smart download scheduling.",
      ],
    },
    {
      title: "App Store Deployment",
      subsections: [
        "iOS App Store",
        "Google Play Store",
        "Release Management",
        "User Analytics"
      ],
      body: [
        "Successfully published on iOS App Store with comprehensive metadata, screenshots, and promotional materials.",
        "Deployed to Google Play Store with optimized APK size and compatibility across Android devices.",
        "Implemented automated release pipeline with version management and staged rollouts.",
        "Integrated analytics to track user engagement, performance metrics, and feature usage.",
      ],
    },
  ],
};
