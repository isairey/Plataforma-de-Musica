import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export class WakelockService {
  private static isActive = false;
  private static tag = 'openspot-music';

  
  static async activate() {
    try {
      if (!this.isActive) {
        await activateKeepAwakeAsync(this.tag);
        this.isActive = true;
      }
    } catch (error) {
      console.error('Failed to activate wakelock:', error);
    }
  }

  
  static async deactivate() {
    try {
      if (this.isActive) {
        deactivateKeepAwake(this.tag);
        this.isActive = false;
      }
    } catch (error) {
      console.error('Failed to deactivate wakelock:', error);
    }
  }

  
  static isWakelockActive(): boolean {
    return this.isActive;
  }

  
  static async toggle() {
    if (this.isActive) {
      await this.deactivate();
    } else {
      await this.activate();
    }
  }
}

