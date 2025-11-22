import type { GameContent, ClassDefinition, EquipmentContent, PowerDefinition, RandomTables, EnemyDefinition } from '../types/content';
import { getSafeStorage } from '../utils/storageAvailable';

const CONTENT_STORAGE_KEY = 'morkborg_content';
const CONTENT_VERSION = '1.0.0';

export class ContentService {
  private static instance: ContentService;
  private content: GameContent | null = null;

  private constructor() {}

  static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  async loadContent(): Promise<GameContent> {
    // Check if content exists in storage
    const storage = getSafeStorage();
    const stored = storage.getItem(CONTENT_STORAGE_KEY);

    if (stored) {
      try {
        this.content = JSON.parse(stored) as GameContent;
        return this.content;
      } catch (error) {
        console.error('Error parsing stored content:', error);
      }
    }

    // Load default content from JSON files
    return await this.loadDefaultContent();
  }

  private async loadDefaultContent(): Promise<GameContent> {
    try {
      const [classesRes, equipmentRes, powersRes, tablesRes, enemiesRes] = await Promise.all([
        fetch('/data/classes.json'),
        fetch('/data/equipment.json'),
        fetch('/data/powers.json'),
        fetch('/data/tables.json'),
        fetch('/data/enemies.json'),
      ]);

      const classesData = await classesRes.json();
      const equipmentData = await equipmentRes.json();
      const powersData = await powersRes.json();
      const tablesData = await tablesRes.json();
      const enemiesData = await enemiesRes.json();

      this.content = {
        classes: classesData.classes,
        equipment: {
          weapons: equipmentData.weapons,
          armor: equipmentData.armor,
          items: equipmentData.items,
        },
        powers: powersData.powers,
        tables: {
          names: tablesData.names,
          terribleTraits: tablesData.terribleTraits,
          brokenBodies: tablesData.brokenBodies,
          badHabits: tablesData.badHabits,
        },
        enemies: enemiesData.enemies || [],
        version: CONTENT_VERSION,
        custom: false,
      };

      // Save to localStorage
      this.saveContent();

      return this.content;
    } catch (error) {
      console.error('Error loading default content:', error);
      throw new Error('Failed to load game content');
    }
  }

  getContent(): GameContent {
    if (!this.content) {
      throw new Error('Content not loaded. Call loadContent() first.');
    }
    return this.content;
  }

  getClasses(): ClassDefinition[] {
    return this.getContent().classes;
  }

  getClass(id: string): ClassDefinition | undefined {
    return this.getContent().classes.find(c => c.id === id);
  }

  getEquipment(): EquipmentContent {
    return this.getContent().equipment;
  }

  getPowers(): PowerDefinition[] {
    return this.getContent().powers;
  }

  getTables(): RandomTables {
    return this.getContent().tables;
  }

  getEnemies(): EnemyDefinition[] {
    return this.getContent().enemies || [];
  }

  async uploadCustomContent(jsonContent: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonContent);

      // Validate structure (basic check)
      if (!parsed.classes && !parsed.equipment && !parsed.powers && !parsed.tables) {
        throw new Error('Invalid content structure');
      }

      // Merge with existing content
      const current = this.getContent();

      if (parsed.classes) {
        current.classes = [...current.classes, ...parsed.classes];
      }

      if (parsed.equipment) {
        if (parsed.equipment.weapons) {
          current.equipment.weapons = [...current.equipment.weapons, ...parsed.equipment.weapons];
        }
        if (parsed.equipment.armor) {
          current.equipment.armor = [...current.equipment.armor, ...parsed.equipment.armor];
        }
        if (parsed.equipment.items) {
          current.equipment.items = [...current.equipment.items, ...parsed.equipment.items];
        }
      }

      if (parsed.powers) {
        current.powers = [...current.powers, ...parsed.powers];
      }

      current.custom = true;
      this.content = current;
      this.saveContent();
    } catch (error) {
      console.error('Error uploading custom content:', error);
      throw new Error('Failed to upload custom content');
    }
  }

  async resetToDefault(): Promise<GameContent> {
    const storage = getSafeStorage();
    storage.removeItem(CONTENT_STORAGE_KEY);
    return await this.loadDefaultContent();
  }

  exportContent(): string {
    return JSON.stringify(this.getContent(), null, 2);
  }

  private saveContent(): void {
    if (this.content) {
      const storage = getSafeStorage();
      storage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(this.content));
    }
  }
}

export const contentService = ContentService.getInstance();
