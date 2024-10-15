export function clickButton(selector: string) {
  const button = document.querySelector(selector) as HTMLButtonElement;
  if (button) button.click();
}

export function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
