import { NextRequest, NextResponse } from 'next/server';

// Simulated database for tokenized skins
let tokenizedSkins = [
  { 
    id: '1',
    name: 'AWP | Dragon Lore', 
    price: 2500, 
    image: '/awp.webp',
    totalQuantity: 10,
    availableQuantity: 10,
    pricePerItem: 2500.00,
    wear: 'Factory New',
    float: 0.0234
  },
  { 
    id: '2',
    name: 'Butterfly Knife | Fade', 
    price: 1800, 
    image: '/btknife.png',
    totalQuantity: 15,
    availableQuantity: 15,
    pricePerItem: 1800.00,
    wear: 'Minimal Wear',
    float: 0.1267
  },
  { 
    id: '3',
    name: 'AK-47 | Redline', 
    price: 120, 
    image: '/ak47-redline.png',
    totalQuantity: 25,
    availableQuantity: 25,
    pricePerItem: 120.00,
    wear: 'Field-Tested',
    float: 0.2834
  },
  { 
    id: '4',
    name: 'M4A4 | Howl', 
    price: 3200, 
    image: '/M4A4.png',
    totalQuantity: 5,
    availableQuantity: 5,
    pricePerItem: 3200.00,
    wear: 'Well-Worn',
    float: 0.4125
  }
];

// GET - Retrieve all tokenized skins
export async function GET() {
  return NextResponse.json(tokenizedSkins);
}

// POST - Purchase items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skinId, quantity, totalCost } = body;
    
    const skin = tokenizedSkins.find(s => s.id === skinId);
    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }
    
    if (skin.availableQuantity < quantity) {
      return NextResponse.json({ error: 'Not enough items available' }, { status: 400 });
    }
    
    // Create purchase record (in a real app, this would be saved to database)
    const purchase = {
      id: Date.now().toString(),
      skinId,
      quantity,
      totalCost,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT - Update quantity for a skin (after purchase)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { skinId, quantityPurchased } = body;
    
    const skin = tokenizedSkins.find(s => s.id === skinId);
    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }
    
    if (skin.availableQuantity < quantityPurchased) {
      return NextResponse.json({ error: 'Not enough items available' }, { status: 400 });
    }
    
    skin.availableQuantity -= quantityPurchased;
    
    return NextResponse.json(skin);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}