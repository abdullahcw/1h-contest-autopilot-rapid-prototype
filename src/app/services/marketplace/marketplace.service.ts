import { Injectable } from '@angular/core';
import { ApiService, EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  shopGameBeingEdited: any = {};
  selectedCategory;
  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }


  getMarketplaceGameCategories(categoryId = '') {
    const queryParams = `game_category_id=${categoryId}`;
    return this.requestManager.get(`${EndPoint.GET_MARKETPLACE_GAME_CATEGORIES}`, queryParams);
  }
  getAllShopCategoryAndGames(company_id) {
    const queryParams = `offset=0&limit=6&company_id=${company_id}`;
    return this.requestManager.get(`${EndPoint.GET_SHOP_ALL_GAMES}`,queryParams);
  }
  getMarketplaceGameBySearch(gameName, categoryId = null) {
    let queryParams;
    if(categoryId){
       queryParams = `game_name=${gameName}&category_id=${categoryId}`;
    }else{
       queryParams = `game_name=${gameName}`;
    }
    return this.requestManager.get(`${EndPoint.GET_SHOP_GAME}`, queryParams);
  }

  getMarketplaceBannerImage() {
    return this.requestManager.get(`${EndPoint.GET_MARKETPLACE_BANNER_IMAGE}`);
  }

  addGameToMarketplace(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME_TO_MARKETPLACE}`, payload);
  }

  updateMarketplaceBannerImage(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_MARKETPLACE_BANNER_IMAGE}`, payload);
  }

  getMarketplaceGames(category_id, offset, limit) {
    const queryParams = `category_id=${category_id}&offset=${offset}&limit=${limit}`;
    return this.requestManager.get(`${EndPoint.GET_MARKETPLACE_GAMES_BY_CATEGORY}`, queryParams);
  }

  addMarketplaceGameToLibrary(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME_MARKETPLACE_TO_LIBRARY}`, payload);
  }

  removeMarketplaceGame(payload) {
    return this.requestManager.post(`${EndPoint.REMOVE_MARKETPLACE_GAME}`, payload);
  }

  updateMarketplaceGame(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_MARKETPLACE_GAME}`, payload);
  }
  shopPreviewDetails(game_id) {
    const queryParams = `game_id=${game_id}`;
    return this.requestManager.get(`${EndPoint.GET_GAME_PREVIEW_DETAILS}`, queryParams);
  }

  updateShopGameDetails(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_SHOP_GAME_PREVIEW_DETAILS}`, payload);
  }

  updateShopGamePosition(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_SHOP_GAME_POSITION}`, payload);
  }
}
