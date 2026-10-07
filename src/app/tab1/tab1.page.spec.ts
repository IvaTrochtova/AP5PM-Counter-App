import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  const counterServiceMock = {
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    counters: () => [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    counterServiceMock.add.mockResolvedValue(undefined);
    counterServiceMock.remove.mockResolvedValue(undefined);
    counterServiceMock.clear.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [Tab1Page],
      providers: [
        {
          provide: CounterService,
          useValue: counterServiceMock,
        },
      ],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a saved counter to the counter service', async () => {
    const counter: SavedCounter = {
      id: 'first',
      name: 'První',
      value: 1,
      createdAt: '2026-09-17T08:00:00.000Z',
    };

    await component.onSaved(counter);

    expect(counterServiceMock.add).toHaveBeenCalledWith(counter);
  });
});