// Identifica Visa y Mastercard por sus prefijos.
export function detectCardBrand(number) {
  const digits = number.replace(/\D/g, "");

  if (/^4/.test(digits)) {
    return "Visa";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if (
    (digits.length >= 2 && firstTwo >= 51 && firstTwo <= 55) ||
    (digits.length >= 4 && firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "Mastercard";
  }

  return "";
}

// Algoritmo de Luhn.
export function isValidLuhn(number) {
  const digits = number.replace(/\D/g, "");

  if (!digits) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

    if (doubleDigit) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

export function validateCardNumber(number) {
  const digits = number.replace(/\D/g, "");
  const brand = detectCardBrand(digits);

  if (!brand) return false;

  if (brand === "Mastercard" && digits.length !== 16) {
    return false;
  }

  if (brand === "Visa" && digits.length !== 16) return false;

  return isValidLuhn(digits);
}

// Formato visual: 4111 1111 1111 1111
export function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function validateExpiration(month, year) {
  const mm = Number(month);
  const yyyy = Number(year);
  const today = new Date();

  if (!Number.isInteger(mm) || mm < 1 || mm > 12) {
    return false;
  }

  if (!Number.isInteger(yyyy) || yyyy < 2000 || yyyy > 2100) {
    return false;
  }

  return (
    yyyy > today.getFullYear() ||
    (yyyy === today.getFullYear() && mm >= today.getMonth() + 1)
  );
}