export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatINR(n: number) {
  return `\u20B9${n.toLocaleString('en-IN')}`;
}
