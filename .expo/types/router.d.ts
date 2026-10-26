/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(dashboard)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(dashboard)'}/ingredientsTab` | `/ingredientsTab`; params?: Router.UnknownInputParams; } | { pathname: `${'/(dashboard)'}/mealplan` | `/mealplan`; params?: Router.UnknownInputParams; } | { pathname: `${'/(dashboard)'}/recipes` | `/recipes`; params?: Router.UnknownInputParams; } | { pathname: `${'/(dashboard)'}/shoppinglist` | `/shoppinglist`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(dashboard)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(dashboard)'}/ingredientsTab` | `/ingredientsTab`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(dashboard)'}/mealplan` | `/mealplan`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(dashboard)'}/recipes` | `/recipes`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(dashboard)'}/shoppinglist` | `/shoppinglist`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(dashboard)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(dashboard)'}/ingredientsTab${`?${string}` | `#${string}` | ''}` | `/ingredientsTab${`?${string}` | `#${string}` | ''}` | `${'/(dashboard)'}/mealplan${`?${string}` | `#${string}` | ''}` | `/mealplan${`?${string}` | `#${string}` | ''}` | `${'/(dashboard)'}/recipes${`?${string}` | `#${string}` | ''}` | `/recipes${`?${string}` | `#${string}` | ''}` | `${'/(dashboard)'}/shoppinglist${`?${string}` | `#${string}` | ''}` | `/shoppinglist${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString | Router.ExternalPathString | `/_sitemap` | `${'/(dashboard)'}` | `/` | `${'/(dashboard)'}/ingredientsTab` | `/ingredientsTab` | `${'/(dashboard)'}/mealplan` | `/mealplan` | `${'/(dashboard)'}/recipes` | `/recipes` | `${'/(dashboard)'}/shoppinglist` | `/shoppinglist`; params?: Router.UnknownInputParams; };
    }
  }
}
