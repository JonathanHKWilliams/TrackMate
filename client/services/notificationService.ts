import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Task } from '../types/task';
import { Project } from '../types/project';

// Configure notification handler with custom settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Trigger a local notification with sound
// This uses the device's default notification sound
export const playNotificationSound = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true, // Uses default system sound
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Cancel all active notifications (stops sound)
export const stopNotificationSound = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error stopping notification sound:', error);
  }
};

// Schedule task reminder notification
export const scheduleTaskReminder = async (task: Task) => {
  if (!task.due_at) return;

  const dueDate = new Date(task.due_at);
  const reminderTime = new Date(dueDate.getTime() - task.reminder_offset_minutes * 60000);
  
  // Format due time
  const dueTimeStr = dueDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  
  // Priority emoji
  const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
  
  // Only schedule if reminder is in the future
  if (reminderTime > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${priorityEmoji} TrackMate: You Have a Task Due Soon`,
        body: `"${task.title}"\nDue: ${dueTimeStr}`,
        data: { taskId: task.id, type: 'task', priority: task.priority },
        sound: true,
        badge: 1,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });
  }
};

// Schedule project deadline notification
export const scheduleProjectDeadline = async (project: Project) => {
  if (!project.end_date) return;

  const endDate = new Date(project.end_date);
  const reminderTime = new Date(endDate.getTime() - 24 * 60 * 60000); // 1 day before
  
  // Only schedule if reminder is in the future
  if (reminderTime > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: ' Project Deadline',
        body: `"${project.name}"Your Project deadline is tomorrow!`,
        data: { projectId: project.id, type: 'project' },
        sound: true, // Uses default system notification sound
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });
  }
};

// Cancel all notifications for a task
export const cancelTaskNotifications = async (taskId: string) => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of notifications) {
    if (notification.content.data?.taskId === taskId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

// Cancel all notifications for a project
export const cancelProjectNotifications = async (projectId: string) => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of notifications) {
    if (notification.content.data?.projectId === projectId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

// Setup notification listeners
export const setupNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (data: any) => void
) => {
  // Listen for notifications while app is foregrounded
  const subscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  
  // Listen for notification responses (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    if (onNotificationTapped) {
      onNotificationTapped(data);
    }
  });
  
  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
};
