export default function BlogPost() {
  const images = [
    {
      url: "https://i.guim.co.uk/img/media/440eaf3836726a31f26d7cd7bf3c2728a0dda361/117_83_2505_2004/master/2505.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Belgium's Janice Cayman celebrates scoring their second goal with Mariam Toloba. Photograph: Stéphane Mahé/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/77fa488391a9242428a564448bd38d7eaf98a556/84_313_4253_2836/master/4253.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Jessica Silva of Portugal looks rueful at full-time. Photograph: Alexander Hassenstein/Getty Images",
    },
    {
      url: "https://i.guim.co.uk/img/media/0a2d92a3fea3265d5488ddeacb57bef717d5d931/0_0_3456_2371/master/3456.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Janice Cayman shoots past Diana Gomes of Portugal to put Belgium ahead. Photograph: Alexander Hassenstein/Getty Images",
    },
    {
      url: "https://i.guim.co.uk/img/media/440eaf3836726a31f26d7cd7bf3c2728a0dda361/0_0_3213_2186/master/3213.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Belgium’s Janice Cayman celebrates scoring their second goal with Mariam Toloba. Photograph: Stéphane Mahé/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/da621e5887f101b5ff92143ecc58cd1f8f88446c/511_536_1144_707/master/1144.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Portugal’s Telma Encarnacao scores their equaliser past Belgium’s keeper Lisa Lichtfus. Photograph: Stéphane Mahé/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/6896191ab554eb72a065f6d6dd196494bf3b7fbe/626_0_5538_4430/master/5538.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Encarnacao celebrates. Photograph: Fabrice Coffrini/AFP/Getty Images",
    },
    {
      url: "https://i.guim.co.uk/img/media/a6ebb360a0420fda084ba9b3a155a00080ba5fd7/501_331_3177_1973/master/3177.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Belgium's Mariam Toloba slots the ball past Portugal's keeper Patricia Morais. Photograph: Stéphane Mahé/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/ab47addec749a7ee7a9d380d522bba2aa42c226b/0_0_2559_3286/master/2559.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Belgium's Mariam Toloba shows solidarity with her crocked teammate Jassina Blom by holding up her shirt whilst celebrating. Photograph: Stéphane Mahé/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/141145a87725f159f810587c67ffd0344333b2e8/0_0_4813_2939/master/4813.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Once again Ana Capeta (right) is thwarted by Belgian keeper Lisa Lichtfus. Photograph: Denis Balibouse/Reuters",
    },
    {
      url: "https://i.guim.co.uk/img/media/a13ee5885fdcec691cc1093c4bd464c24ff5c02d/0_0_2174_1449/master/2174.jpg?width=465&dpr=1&s=none&crop=none",
      caption:
        "Portugal's Ana Capeta (right) has her shot saved by Belgian keeper Lisa Lichtfus. Photograph: Nuno Veiga/EPA",
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-4">
        🇵🇹 Portugal 1–2 🇧🇪 Belgium Women: Cayman’s Late Winner Seals Dramatic
        Victory
      </h1>
      <p className="mb-6 text-lg">
        Belgium snatched a last-gasp 2–1 win over Portugal in a wild,
        stoppage-time finish that featured two disallowed goals, multiple
        injuries, and a flurry of late drama.
      </p>
      <p className="mb-6 text-lg">
        Tessa Wullaert gave Belgium an early lead in the 3rd minute, but the
        match soon turned chaotic. VAR denied Belgium two more goals—one in each
        half—fueling Portugal’s hope of a comeback. That comeback seemed real
        when Telma Encarnação equalized in the 87th minute after a brilliant
        assist from Kika Nazareth.
      </p>
      <p className="mb-6 text-lg">
        But in the 96th minute, Janice Cayman capitalized on a blocked shot to
        fire home the winner, breaking Portuguese hearts just seconds before the
        final whistle.
      </p>
      <ul className="list-disc ml-6 mb-10 text-base">
        <li>⚽ Goals: Wullaert (3’), Encarnação (87’), Cayman (90+6’)</li>
        <li>❌ VAR drama: Two Belgium goals overturned</li>
        <li>🟨 Cards & Injuries: Several bookings and stoppages</li>
      </ul>

      {images.map(({ url, caption }, index) => (
        <figure key={index} className="mb-10">
          <img src={url} alt={caption} className="w-full rounded shadow" />
          <figcaption className="text-sm text-gray-600 mt-2 italic">
            {caption}
          </figcaption>
        </figure>
      ))}
    </main>
  );
}
