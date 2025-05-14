/**
 * LazyLoadWrapper.tsx
 * 
 * Tato komponenta poskytuje řešení pro líné načítání React komponent
 * používá React.lazy a Suspense pro zlepšení výkonu aplikace
 */
import React, { Suspense, useState, useEffect, ComponentType, LazyExoticComponent } from 'react';

interface LazyLoadWrapperProps<P extends React.JSX.IntrinsicAttributes> {
  /**
   * Funkce, která importuje komponentu pomocí dynamic import
   * Např. () => import('../components/HeavyComponent')
   */
  importCallback: () => Promise<{ default: ComponentType<P> }>;
  
  /** 
   * Props, které se předají lazy-loaded komponentě
   */
  componentProps?: Omit<P, keyof React.JSX.IntrinsicAttributes>;
  
  /** 
   * React element, který se zobrazí během načítání komponenty
   */
  fallback?: React.ReactNode;
  
  /** 
   * Podmínka pro odložené načtení komponenty
   * Např. až když bude komponenta v zorném poli (viewport)
   */
  loadCondition?: boolean;
  
  /** 
   * Určuje, zda se má komponenta načíst až když je v zorném poli
   */
  observeViewport?: boolean;
  
  /** 
   * Kořenový element pro sledování průsečíku (viewport intersection)
   * Ve výchozím stavu null (= prohlížeč viewport)
   */
  root?: Element | null;
  
  /** 
   * Margin kolem kořenového elementu
   */
  rootMargin?: string;
  
  /** 
   * Práh průsečíku: 0.0 až 1.0 (jaká část komponenty musí být viditelná)
   */
  threshold?: number | number[];
}

/**
 * Wrapper pro líné načítání React komponent
 */
export function LazyLoadWrapper<P extends React.JSX.IntrinsicAttributes>(props: LazyLoadWrapperProps<P>) {
  // Výchozí hodnoty
  const {
    importCallback,
    componentProps,
    fallback = <div>Načítání...</div>,
    loadCondition = true,
    observeViewport = false,
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
  } = props;

  // Referenční div, který se bude sledovat pro zobrazení ve viewportu
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(!observeViewport && loadCondition);
  const [LazyComponent, setLazyComponent] = useState<LazyExoticComponent<ComponentType<P>> | null>(null);

  // Efekt pro sledování viewportu
  useEffect(() => {
    if (observeViewport && containerRef) {
      const observer = new IntersectionObserver(
        (entries) => {
          // Pokud je element viditelný a splňuje podmínku načtení
          if (entries[0].isIntersecting && loadCondition) {
            setShouldLoad(true);
            // Přestaneme sledovat element po načtení
            observer.disconnect();
          }
        },
        { root, rootMargin, threshold }
      );

      observer.observe(containerRef);
      return () => observer.disconnect();
    }
    
    // Když se nepoužívá sledování viewportu, načte se podle podmínky
    if (!observeViewport) {
      setShouldLoad(loadCondition);
    }
    
    return undefined;
  }, [containerRef, loadCondition, observeViewport, root, rootMargin, threshold]);

  // Načtení komponenty, pokud by měla být načtena
  useEffect(() => {
    if (shouldLoad && !LazyComponent) {
      const Component = React.lazy(importCallback);
      setLazyComponent(Component);
    }
  }, [shouldLoad, importCallback, LazyComponent]);

  // Pokud používáme viewport sledování, vykreslíme div pro sledování
  if (observeViewport) {
    return (
      <div ref={setContainerRef}>
        {shouldLoad && LazyComponent ? (
          <Suspense fallback={fallback}>
            <LazyComponent {...(componentProps as any)} />
          </Suspense>
        ) : (
          fallback
        )}
      </div>
    );
  }

  // Pokud nepoužíváme viewport sledování, vykreslíme komponentu přímo
  return shouldLoad && LazyComponent ? (
    <Suspense fallback={fallback}>
      <LazyComponent {...(componentProps as any)} />
    </Suspense>
  ) : (
    <>{fallback}</>
  );
}

/**
 * Vytváří líně načítanou komponentu, kterou lze použít kdekoli v kódu
 * 
 * @param importCallback Funkce importující komponentu
 * @returns Lazy komponenta zabalená v Suspense
 */
export function createLazyComponent<P extends React.JSX.IntrinsicAttributes>(
  importCallback: () => Promise<{ default: ComponentType<P> }>
) {
  const LazyComponent = React.lazy(importCallback);
  
  return (props: Omit<P, keyof React.JSX.IntrinsicAttributes> & { fallback?: React.ReactNode }) => {
    const { fallback = <div>Načítání...</div>, ...componentProps } = props;
    
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    );
  };
}
