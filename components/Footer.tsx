export function Footer() {
  const groups = [
    {
      title: 'Ecosystem',
      items: ['Trade', 'Earn', 'Win', 'NFT', 'Token Lists'],
    },
    {
      title: 'Business',
      items: ['Farms', 'Launchpad', 'Bridge', 'Pay', 'Merchants'],
    },
    {
      title: 'Developers',
      items: ['Docs', 'GitHub', 'Bug Bounty', 'API', 'Open Source'],
    },
    {
      title: 'Support',
      items: ['Help Center', 'Guides', 'Contact', 'Status', 'Community'],
    },
    {
      title: 'About',
      items: ['Company', 'Careers', 'Partners', 'Press', 'Privacy'],
    },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#050506]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:grid-cols-5">
        <div className="md:col-span-5 mb-2 flex items-center gap-3 border-b border-white/[0.08] pb-7"><span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#2F6BFF] text-sm font-bold">1</span><span className="text-lg font-semibold tracking-tight text-white">1inch</span><span className="ml-auto text-xs text-white/35">A better way to move crypto.</span></div>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="mb-4 text-[13px] font-semibold text-white">{group.title}</div>
            <div className="space-y-2 text-[13px] text-white/45">
              {group.items.map((item) => (
                <div key={item} className="transition-colors hover:text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
