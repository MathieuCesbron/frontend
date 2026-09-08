import { useState, useEffect } from 'react';

export function useCardDefinitions() {
  const [cardsDict, setCardsDict] = useState<Record<number, any>>({});

  useEffect(() => {
    fetch('/cards.json')
      .then((res) => res.json())
      .then((data) => {
        const dict: Record<number, any> = {};
        data.forEach((c: any) => {
          dict[c.templateId] = c;
        });
        setCardsDict(dict);
      })
      .catch((err) => console.error('Could not load card data', err));
  }, []);

  return cardsDict;
}
