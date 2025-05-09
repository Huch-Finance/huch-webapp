import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STEAM_API_KEY = '5E7A0629FA52FD8E0C40C9BF78911B52'

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    
    // Vérifier si l'authentification a réussi
    const claimed_id = searchParams.get('openid.claimed_id')
    
    if (!claimed_id) {
      return NextResponse.redirect(new URL('/borrow?error=steam_auth_failed', request.url))
    }
    
    // Extraire le steamID64 de l'URL claimed_id
    // Format: https://steamcommunity.com/openid/id/76561198XXXXXXXXX
    const steamID64 = claimed_id.split('/').pop()
    
    if (!steamID64) {
      return NextResponse.redirect(new URL('/borrow?error=invalid_steam_id', request.url))
    }
    
    // Récupérer les informations du profil Steam
    const steamProfileResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamID64}`
    )
    
    if (!steamProfileResponse.ok) {
      return NextResponse.redirect(new URL('/borrow?error=steam_api_error', request.url))
    }
    
    const steamProfileData = await steamProfileResponse.json()
    const player = steamProfileData.response.players[0]
    
    if (!player) {
      return NextResponse.redirect(new URL('/borrow?error=steam_profile_not_found', request.url))
    }
    
    // Récupérer les informations supplémentaires du profil Steam pour les afficher
    const playerName = player.personaname || ''
    const playerAvatar = player.avatarfull || ''
    
    // Rediriger vers la page de prêt avec succès et passer l'ID Steam et les infos du profil en paramètres
    return NextResponse.redirect(new URL(`/borrow?steam_connected=true&steam_id=${steamID64}&steam_name=${encodeURIComponent(playerName)}&steam_avatar=${encodeURIComponent(playerAvatar)}`, request.url))
    
  } catch (error) {
    console.error('Steam authentication error:', error)
    return NextResponse.redirect(new URL('/borrow?error=steam_auth_error', request.url))
  }
}
