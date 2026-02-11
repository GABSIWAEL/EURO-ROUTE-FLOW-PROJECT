import { Stomp, Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    relatedEntityId?: string;
    relatedEntityType?: string;
    createdAt: string;
    expiresAt: string;
    dismissedAt?: string;
}

export class WebSocketNotificationService {
    private client: Client | null = null;
    private isConnected = false;
    private listeners: ((notification: Notification) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    /**
     * Connect to WebSocket and subscribe to notifications
     */
    public connect(userId: string, onConnect?: () => void, onError?: (error: any) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const socket = new SockJS(
                `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:8081"}/ws/notifications`
            );

            this.client = Stomp.over(socket);

            this.client.connect(
                {},
                () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Subscribe to user-specific notifications
                    this.client!.subscribe(`/topic/notifications/${userId}`, (message) => {
                        try {
                            const notification = JSON.parse(message.body) as Notification;
                            this.notifyListeners(notification);
                        } catch (error) {
                            // Failed to parse notification
                        }
                    });

                    if (onConnect) {
                        onConnect();
                    }
                    resolve();
                },
                (error) => {
                    this.isConnected = false;
                    if (onError) {
                        onError(error);
                    }
                    this.attemptReconnect(userId, onConnect, onError, resolve, reject);
                }
            );
        });
    }

    /**
     * Disconnect from WebSocket
     */
    public disconnect(): void {
        if (this.client && this.isConnected) {
            this.client.disconnect(() => {
                this.isConnected = false;
            });
        }
    }

    /**
     * Add a listener for incoming notifications
     */
    public subscribe(listener: (notification: Notification) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * Notify all listeners of a new notification
     */
    private notifyListeners(notification: Notification): void {
        this.listeners.forEach((listener) => {
            try {
                listener(notification);
            } catch (error) {
                // Error in notification listener
            }
        });
    }

    /**
     * Check if WebSocket is connected
     */
    public isWebSocketConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Attempt to reconnect with exponential backoff
     */
    private attemptReconnect(
        userId: string,
        onConnect?: () => void,
        onError?: (error: any) => void,
        resolve?: (value: void | PromiseLike<void>) => void,
        reject?: (reason?: any) => void
    ): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;

            setTimeout(() => {
                this.connect(userId, onConnect, onError).then(resolve).catch(reject);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            if (reject) {
                reject(new Error("Failed to connect after maximum attempts"));
            }
        }
    }
}

// Export singleton instance
export const notificationService = new WebSocketNotificationService();
