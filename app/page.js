import Hero from '../public/hero.jpg';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      {/* Background Image + Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0)),
            url(${Hero.src})
          `,
        }}
      ></div>

      {/* Overlay on left side */}
      <section className="relative z-10 w-2/5 min-h-screen flex flex-col justify-center p-12 text-green-400">
        <h1 className="text-6xl font-extrabold mb-6">Carbon Credits System</h1>
        <p className="mb-10 text-lg text-green-300">
          Join the movement to reduce emissions and reward sustainability.
        </p>
        <button className="w-max px-8 py-3 border-2 border-green-400 rounded text-green-400 hover:bg-green-400 hover:text-black transition">
          Sign In
        </button>
      </section>
    </main>
  );
}
