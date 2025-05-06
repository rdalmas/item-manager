import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

export function injectService<T>(service: Type<T>): T {
  return TestBed.inject(service);
}

export function createSpyObj(baseName: string, methodNames: string[]): jasmine.SpyObj<any> {
  return jasmine.createSpyObj(baseName, methodNames);
}