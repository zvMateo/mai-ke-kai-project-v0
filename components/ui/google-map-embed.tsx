export function GoogleMapEmbed() {
  return (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.5583797857203!2d-85.84118472520218!3d10.297121889824016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f9e39527f1021e3%3A0xa5529cf38cffffed!2sMai%20Ke%20Kai%20Surf%20House!5e0!3m2!1ses-419!2sar!4v1769641167728!5m2!1ses-419!2sar"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="rounded-xl sm:rounded-2xl"
      title="Mai Ke Kai Surf House Location"
      aria-label="Interactive map showing Mai Ke Kai Surf House location in Costa Rica"
    />
  );
}
