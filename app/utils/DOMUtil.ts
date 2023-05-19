export function clickButton(selector: string) {
  const button = document.querySelector(selector) as HTMLButtonElement;
  if (button) button.click();
}

export function setInputValue(selector: string, value: any) {
  const input = document.querySelector(selector) as HTMLInputElement;
  if (input) input.value = String(value);
}

export function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export function submitForm(selector: string) {
  const form = document.querySelector(selector) as HTMLFormElement;
  if (form) form.submit();
}
