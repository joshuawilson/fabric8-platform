import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Broadcaster } from 'ngx-base';
import { Contexts, Spaces } from 'ngx-fabric8-wit';
import { UserService } from 'ngx-login-client';
import { Fabric8UIConfig } from './config/fabric8-ui-config';
import { NotificationsService } from './notifications.service';

declare global {
  interface Window {
    analytics: any;
  }
}

@Injectable()
export class AnalyticService {
  constructor(
    public fabric8UIConfig: Fabric8UIConfig,
    public broadcaster: Broadcaster,
    private userService: UserService,
    private router: Router,
    private contexts: Contexts,
    private notificationsService: NotificationsService,
    private spaces: Spaces,
  ) {
    this.init();
  }

  get analytics(): SegmentAnalytics.AnalyticsJS {
    return window.analytics;
  }

  public init() {
    if (this.fabric8UIConfig.analyticsWriteKey) {
      this.initialize(this.fabric8UIConfig.analyticsWriteKey);
      this.track();
    }
  }

  public initialize(apiWriteKey: string) {
    // THIS CODE IS DIRECTLY PASTED FROM SEGMENT
    let analytics = (window.analytics = window.analytics || []);
    if (!analytics.initialize) {
      if (analytics.invoked) {
        window.console && console.error && console.error('Segment snippet included twice.');
      } else {
        analytics.invoked = !0;
        analytics.methods = [
          'trackSubmit',
          'trackClick',
          'trackLink',
          'trackForm',
          'pageview',
          'identify',
          'reset',
          'group',
          'track',
          'ready',
          'alias',
          'debug',
          'page',
          'once',
          'off',
          'on',
        ];
        analytics.factory = function(t) {
          return function() {
            var e = Array.prototype.slice.call(arguments);
            e.unshift(t);
            analytics.push(e);
            return analytics;
          };
        };
        for (var t = 0; t < analytics.methods.length; t++) {
          var e = analytics.methods[t];
          analytics[e] = analytics.factory(e);
        }
        analytics.load = function(t) {
          var e = document.createElement('script');
          e.type = 'text/javascript';
          e.async = !0;
          e.src =
            ('https:' === document.location.protocol ? 'https://' : 'http://') +
            'cdn.segment.com/analytics.js/v1/' +
            t +
            '/analytics.min.js';
          var n = document.getElementsByTagName('script');
          if (n && n instanceof Array && n[0] && n[0].parentNode) {
            n[0].parentNode.insertBefore(e, n[0]);
          }
        };
        analytics.SNIPPET_VERSION = '4.0.0';
        analytics.load(apiWriteKey);
      }
    }
  }

  public track() {
    // Navigation
    this.broadcaster.on('navigate').subscribe((navigation: { url: string }) => {
      if (navigation) {
        this.analytics.page(navigation.url);
      }
    });

    // User login and logout
    this.userService.loggedInUser.subscribe((user) => {
      if (user && user.id) {
        this.identifyUser(user);
        this.analytics.track('logged in', {
          url: this.router.url,
        });
      } else {
        this.analytics.track('logged out');
      }
    });

    this.broadcaster.on('login').subscribe(() => this.analytics.track('login'));

    // Context change
    this.contexts.current.subscribe((context) => {
      if (context && context.type) {
        this.analytics.track('change context', {
          path: context.path,
          type: context.type.name,
        });
      }
    });

    // Space change
    this.spaces.current.subscribe((space) => {
      if (
        space &&
        space.relationalData &&
        space.relationalData.creator &&
        space.relationalData.creator.attributes
      ) {
        this.analytics.track('change space', {
          name: space.name,
          owner: space.relationalData.creator.attributes.username,
        });
      }
    });

    // Notifications
    this.notificationsService.stream.subscribe((notification) => {
      if (notification) {
        this.analytics.track('receive notification', {
          message: notification.message,
          type: notification.type ? notification.type.cssClass : 'unknown',
        });
      }
    });

    // Planner
    // TODO enrich properties
    this.broadcaster
      .on('unique_filter')
      .subscribe((val) => this.analytics.track('reset filters', JSON.stringify(val)));
    this.broadcaster
      .on('item_filter')
      .subscribe((val) => this.analytics.track('add filter', JSON.stringify(val)));

    // App Launcher
    this.activateLauncherEventListeners();
  }

  public activateLauncherEventListeners(): void {
    this.broadcaster.on('analyticsTracker').subscribe((data: any) => {
      const eventKey = data['event'];
      const eventData = data['data'];
      if (eventKey && eventData) {
        this.analytics.track(eventKey, eventData);
      } else if (eventKey) {
        this.analytics.track(eventKey);
      }
    });
  }

  private identifyUser(user: any): any {
    let traits = {
      avatar: user.attributes.imageURL,
      email: user.attributes.email,
      username: user.attributes.username,
      website: user.attributes.url,
      name: user.attributes.fullName,
      description: user.attributes.bio,
    };
    this.analytics.identify(user.id, traits);
  }
}
