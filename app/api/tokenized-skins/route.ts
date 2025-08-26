import { NextRequest, NextResponse } from 'next/server';

// Simulated database for tokenized skins
let tokenizedSkins = [
  { 
    id: '1',
    name: 'AWP | Dragon Lore', 
    price: 2500, 
    image: '/awp.webp',
    totalShares: 100,
    availableShares: 100,
    pricePerShare: 25.00
  },
  { 
    id: '2',
    name: 'Butterfly Knife | Fade', 
    price: 1800, 
    image: '/btknife.png',
    totalShares: 100,
    availableShares: 100,
    pricePerShare: 18.00
  },
  { 
    id: '3',
    name: 'AK-47 | Redline', 
    price: 120, 
    image: '/ak47-redline.png',
    totalShares: 100,
    availableShares: 100,
    pricePerShare: 1.20
  },
  { 
    id: '4',
    name: 'M4A4 | Howl', 
    price: 3200, 
    image: '/M4A4.png',
    totalShares: 100,
    availableShares: 100,
    pricePerShare: 32.00
  }
];

// GET - Retrieve all tokenized skins
export async function GET() {
  return NextResponse.json(tokenizedSkins);
}

// POST - Add a new tokenized skin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newSkin = {
      id: Date.now().toString(),
      ...body,
      totalShares: 100,
      availableShares: 100,
      pricePerShare: body.price / 100
    };
    tokenizedSkins.push(newSkin);
    return NextResponse.json(newSkin, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT - Update shares for a skin (purchase shares)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { skinId, sharesPurchased } = body;
    
    const skin = tokenizedSkins.find(s => s.id === skinId);
    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }
    
    if (skin.availableShares < sharesPurchased) {
      return NextResponse.json({ error: 'Not enough shares available' }, { status: 400 });
    }
    
    skin.availableShares -= sharesPurchased;
    
    return NextResponse.json(skin);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}