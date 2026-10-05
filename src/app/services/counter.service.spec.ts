import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    await Promise.all([service.initialize(), service.initialize()]);
    await service.initialize();
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });
//test 1: načtení uložených dat
  it('should load saved counters after initialization', async () => {
  getMock.mockResolvedValue({
    value: JSON.stringify([first, second]),
  });

  await service.initialize();
  expect(service.counters()).toEqual([first, second]);
  expect(service.initialized()).toBe(true);
  expect(getMock).toHaveBeenCalledWith({
    key: 'saved-counters',
  });
});
//test 2: přidání záznamu
it('should add a counter to the beginning and save it', async () => {
  getMock.mockResolvedValue({
    value: JSON.stringify([second]),
  });

  await service.initialize();
  await service.add(first);
  expect(service.counters()).toEqual([first, second]);
  expect(setMock).toHaveBeenCalledWith({
    key: 'saved-counters',
    value: JSON.stringify([first, second]),
  });
});

//test 3: odebrání jednoho záznamu
it('should remove only the selected counter and save the new state', async () => {
  getMock.mockResolvedValue({
    value: JSON.stringify([first, second]),
  });

  await service.initialize();
  await service.remove(first.id);
  expect(service.counters()).toEqual([second]);
  expect(setMock).toHaveBeenCalledWith({
    key: 'saved-counters',
    value: JSON.stringify([second]),
  });
});

//test 4: vymazání historie
it('should clear counters and remove saved history from Preferences', async () => {
  getMock.mockResolvedValue({
    value: JSON.stringify([first, second]),
  });

  await service.initialize();
  await service.clear();
  expect(service.counters()).toEqual([]);
  expect(removeMock).toHaveBeenCalledTimes(1);
  expect(removeMock).toHaveBeenCalledWith({
    key: 'saved-counters',
  });

  expect(setMock).not.toHaveBeenCalled();
});

//test 5: poškozená uložená hodnota
it('should recover from invalid JSON and log an error', async () => {
  getMock.mockResolvedValue({
    value: '{invalid-json',
  });

  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  await expect(service.initialize()).resolves.toBeUndefined();
  expect(service.counters()).toEqual([]);
  expect(service.initialized()).toBe(true);
  expect(consoleErrorSpy).toHaveBeenCalled();

  consoleErrorSpy.mockRestore();
});
});