//
//  UIBarButtonItem+Plainify.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 8/30/25.
//

#import "UIBarButtonItem+Plainify.h"

@import ObjectiveC;

@implementation UIBarButtonItem (Plainify)

+ (void) load
{
  static dispatch_once_t once_token;
  dispatch_once(&once_token, ^{
    Class cls = self;

    Method origInit = class_getInstanceMethod(cls, @selector(initWithCustomView:));
    Method swizInit = class_getInstanceMethod(cls, @selector(mb_initWithCustomView:));
    if (origInit && swizInit) {
      method_exchangeImplementations(origInit, swizInit);
    }
  });
}

- (instancetype) mb_initWithCustomView:(UIView *)customView
{
  // call original (now-swizzled) init
  UIBarButtonItem *item = [self mb_initWithCustomView:customView];

  if (@available(iOS 26, *)) {
    UIActivityIndicatorView* spinner = [self findFirstIndicatorInView:customView];
    if (spinner) {
      item.hidesSharedBackground = YES;
    }
  }
  
  return item;
}

- (UIActivityIndicatorView *) findFirstIndicatorInView:(UIView *)rootView
{
  NSMutableArray* queue = [NSMutableArray arrayWithObject:rootView];

  while (queue.count > 0) {
    UIView* view = [queue firstObject];
    [queue removeObjectAtIndex:0];
      
    if ([view isKindOfClass:[UIActivityIndicatorView class]]) {
      return (UIActivityIndicatorView *)view;
    }

    // add subviews to the queue
    for (UIView *subview in view.subviews) {
      [queue addObject:subview];
    }
  }

  return nil;
}

@end
