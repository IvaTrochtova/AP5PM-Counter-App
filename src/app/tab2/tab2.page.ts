import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);

  readonly searchTerm = signal('');
  readonly sortBy = signal<'name' | 'value'>('name');

  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');

  // 1. Součet hodnot všech uložených počítadel.
  // Number(...) je záměrně použito i v případě, že by storage vrátila hodnotu jako string.
  readonly total = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + (Number(counter.value) || 0), 0),
  );

  // 2 + 3. Vyhledávání podle názvu a řazení podle názvu / hodnoty
  readonly displayedCounters = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase('cs');

    const filtered = this.counterService.counters().filter((counter) =>
      counter.name.toLocaleLowerCase('cs').includes(search),
    );

    if (this.sortBy() === 'name') {
      return [...filtered].sort((a, b) =>
        a.name.localeCompare(b.name, 'cs'),
      );
    }

    return [...filtered].sort(
      (a, b) => Number(b.value) - Number(a.value),
    );
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.showToast('Počítadlo bylo odstraněno.');
  }

  // 4. Potvrzení smazání přes skutečný Ionic ion-alert
  async confirmClear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vymazat celou historii?',
      message: 'Tuto akci nelze vrátit zpět.',
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
        },
        {
          text: 'Smazat',
          role: 'destructive',
          handler: () => {
            void this.clear();
          },
        },
      ],
    });

    await alert.present();
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
    this.showToast('Historie byla vymazána.');
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}

