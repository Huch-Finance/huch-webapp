import { NextRequest, NextResponse } from 'next/server';
import { csCards } from '@/lib/cscards';

// Convert csCards to tokenized skins format
let tokenizedSkins = csCards.map(card => ({
  id: card.id,
  name: card.name,
  price: card.price,
  image: card.cardImage, // Using NFT card image instead of original skin image
  totalQuantity: card.totalQuantity,
  availableQuantity: card.availableQuantity,
  pricePerItem: card.price,
  wear: card.wear,
  float: card.float,
  rarity: card.rarity,
  weapon: card.weapon,
  skin: card.skin,
  collection: card.collection,
  originalImage: card.originalImage // Keep original for reference
}));

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