import { NextRequest, NextResponse } from 'next/server'

// TODO: Déplacer cette clé dans un fichier .env pour des raisons de sécurit@é
const STEAM_API_KEY = '5E7A0629FA52FD8E0C40C9BF78911B52'

/**
 * Steam authentication callback handler (OpenID)
 * 
 * This endpoint is called by Steam after a successful OpenID authentication.
 * Complete process:
 * 1. Retrieve Steam identifier (steamID64) from callback parameters
 * 2. Call Steam API to get detailed user profile information
 * 3. Store essential information (steamID, avatar, username) in cookies
 * 4. Redirect to the borrow page with profile information
 *
 * In case of error at any step, the user is redirected to
 * the borrow page with an appropriate error parameter.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const claimed_id = searchParams.get('openid.claimed_id')
    
    if (!claimed_id) {
      return NextResponse.redirect(new URL('/borrow?error=steam_auth_failed', request.url))
    }
    const steamID64 = claimed_id.split('/').pop()
    
    if (!steamID64) {
      return NextResponse.redirect(new URL('/borrow?error=invalid_steam_id', request.url))
    }
    
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
    
    const playerName = player.personaname || ''
    const playerAvatar = player.avatarfull || ''
    
    return NextResponse.redirect(new URL(`/borrow?steam_connected=true&steam_id=${steamID64}&steam_name=${encodeURIComponent(playerName)}&steam_avatar=${encodeURIComponent(playerAvatar)}`, request.url))
    
  } catch (error) {
    console.error('Steam authentication error:', error)
    return NextResponse.redirect(new URL('/borrow?error=steam_auth_error', request.url))
  }
}
