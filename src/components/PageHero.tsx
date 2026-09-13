type Props = {
  kicker: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

/**
 * Full-bleed photo hero used on every secondary page.
 * Falls back to an elegant placeholder gradient when no image has been
 * uploaded yet in the administration — never deforms or stretches a real photo.
 */
export default function PageHero({ kicker, title, description, imageUrl }: Props) {
  return (
    <div className="relative flex min-h-[300px] items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={
          imageUrl
            ? { backgroundImage: `url(${imageUrl})` }
            : {
                backgroundImage:
                  "linear-gradient(155deg,#3a4666 0%,#1a2440 45%,#0E1B3C 100%)"
              }
        }
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,13,28,0.92) 0%, rgba(8,13,28,0.72) 38%, rgba(8,13,28,0.32) 72%, rgba(8,13,28,0.12) 100%)"
          }}
        />
        {!imageUrl && (
          <div className="absolute right-5 top-4 z-10 border border-dashed border-white/30 px-3 py-1.5 text-[0.64rem] text-white/50">
            Photo à ajouter
          </div>
        )}
        <div
          className="absolute bottom-0 right-0 top-0 w-1.5"
          style={{
            background: "linear-gradient(180deg,#CE1126 0 33.3%,#E8B923 33.3% 66.6%,#0F8A4F 66.6% 100%)"
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-8 py-14 max-[640px]:px-5">
        <p className="kicker !text-gold">{kicker}</p>
        <h1 className="mb-3.5 font-display text-3xl font-extrabold uppercase leading-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-[60ch] text-[1.03rem] text-[#D6D9E0]">{description}</p>
      </div>
    </div>
  );
}
