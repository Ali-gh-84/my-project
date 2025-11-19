export interface CardButton {
  text: string;
  color: string;
  bgcolor: string;
  action: string;
}

export interface MainPageCard {
  title: string;
  degree: string;
  buttons: CardButton[];
  img: string;
  overlay?: string;
  colorText: string;
  size?: string;
  weight?: string;
}

export type MainPageModel = MainPageCard[];
