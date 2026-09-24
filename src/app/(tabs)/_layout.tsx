import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = Dimensions.get('window');
  const containerWidth = width - 32;
  const TAB_WIDTH = containerWidth / state.routes.length;

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      // Apple-like fluid spring: organic, smooth, and settles nicely without harsh clamping
      transform: [
        { translateX: withSpring(state.index * TAB_WIDTH, { damping: 20, stiffness: 160, mass: 0.8 }) }
      ],
      opacity: withTiming(state.index === 2 ? 0 : 1, { duration: 200 })
    };
  });

  return (
    <View style={styles.floatingContainer}>
      <BlurView intensity={80} tint="light" style={styles.tabBarContainer}>
        {/* Apple Segmented Control / Liquid Pill Style Indicator */}
        <Animated.View style={[styles.slidingIndicator, { width: TAB_WIDTH }, animatedIndicatorStyle]}>
          <View style={styles.indicatorWindow} />
        </Animated.View>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? '#4b2eff' : '#666666'; // Slightly deeper purple for better contrast on glass
          const isCenterButton = index === 2;

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Animated.View style={useAnimatedStyle(() => ({
                transform: [{ scale: withSpring(isFocused && !isCenterButton ? 1.05 : 1) }]
              }))}>
                {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 24 }) : null}
              </Animated.View>
              
              {label ? (
                <Animated.Text style={[
                  styles.tabLabel, 
                  { color },
                  useAnimatedStyle(() => ({
                    transform: [{ translateY: withSpring(isFocused ? 0 : 2) }],
                    opacity: withTiming(isFocused ? 1 : 0.8)
                  }))
                ]}>
                  {label as string}
                </Animated.Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="radar"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => (
            <Feather name="compass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '', // No title for the middle button
          tabBarIcon: () => (
            <View className="bg-[#6b4eff] w-[52px] h-[52px] rounded-full items-center justify-center" style={styles.shadow}>
              <Feather name="plus" size={28} color="#ffffff" />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            console.log('Big + button pressed!');
          },
        })}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="message-square" size={24} color={color} />
              <View className="absolute -top-2 -right-2 bg-[#ef4444] rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-[1.5px] border-white">
                <Text className="text-white text-[9px] font-bold">3</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Squad',
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    // Add shadow to the container holding the blur for depth
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 36,
    height: 72,
    alignItems: 'center',
    paddingHorizontal: 0,
    // Glassmorphism borders
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden', // Ensure the blur stays inside the rounded corners
    // Add a very subtle dark overlay to the glass so the bright slider stands out more
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700', 
    marginTop: 4,
  },
  shadow: {
    shadowColor: '#6b4eff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  indicatorWindow: {
    width: '78%', 
    height: '100%',
    // A soft translucent purple pill that contrasts gorgeously with the blurred glass track
    backgroundColor: 'rgba(107, 78, 255, 0.12)', 
    borderRadius: 24,
  }
});




