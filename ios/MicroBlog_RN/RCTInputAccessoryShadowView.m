//
//  RCTInputAccessoryShadowView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 10/24/23.
//

#import "RCTInputAccessoryShadowView.h"

@implementation RCTInputAccessoryShadowView (ScreenWidth)

- (void) insertReactSubview:(RCTShadowView *)subview atIndex:(NSInteger)atIndex
{
  [super insertReactSubview:subview atIndex:atIndex];

  CGRect r = [[UIScreen mainScreen] bounds];
  subview.width = (YGValue) { r.size.width, YGUnitPoint };
}

@end
